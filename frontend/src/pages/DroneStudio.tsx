import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Crop, DiseaseDiagnosis, DroneFlight, DroneScan } from '../services/types';
import { DroneScanRadar } from '../components/drone/DroneScanRadar';
import {
  Plane,
  Upload,
  Sparkles,
  Calendar,
  Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const DroneStudio: React.FC = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [activeFlight, setActiveFlight] = useState<DroneFlight | null>(null);
  const [scans, setScans] = useState<DroneScan[]>([]);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiseaseDiagnosis | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [remedyTab, setRemedyTab] = useState<'organic' | 'chemical'>('organic');

  // Upload Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altitude, setAltitude] = useState<number>(14.5);
  const [latitude, setLatitude] = useState<number>(21.1462);
  const [longitude, setLongitude] = useState<number>(79.0889);

  useEffect(() => {
    // Load crops and flight sessions
    api.getCrops().then((list) => {
      setCrops(list);
      if (list.length > 0) {
        setSelectedCropId(list[0].id);
        loadCropScans(list[0].id);
      }
    });

    api.getFlights().then((flights) => {
      const ongoing = flights.find((f) => f.status === 'IN_PROGRESS');
      if (ongoing) setActiveFlight(ongoing);
    });
  }, []);

  const loadCropScans = async (cropId: string) => {
    try {
      const scanList = await api.getScans(cropId);
      setScans(scanList);
      if (scanList.length > 0 && scanList[0].diagnosis) {
        setCurrentDiagnosis(scanList[0].diagnosis);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartFlight = async () => {
    try {
      const flight = await api.startFlight({
        start_latitude: latitude,
        start_longitude: longitude,
        altitude_m: altitude,
      });
      setActiveFlight(flight);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndFlight = async () => {
    if (!activeFlight) return;
    try {
      await api.endFlight(activeFlight.id);
      setActiveFlight(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Helper to load sample agricultural pathology captures
  const handleSelectSample = (sampleType: 'blight' | 'mildew' | 'healthy') => {
    // Generate an in-memory sample canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (sampleType === 'blight') {
        // Necrotic brown/yellow lesion pattern
        ctx.fillStyle = '#1e3a1e';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(130, 130, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(140, 140, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(145, 145, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (sampleType === 'mildew') {
        // Powdery whitish fungal patches
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        for (let i = 0; i < 40; i++) {
          const rx = 60 + Math.random() * 180;
          const ry = 60 + Math.random() * 180;
          ctx.beginPath();
          ctx.arc(rx, ry, 5 + Math.random() * 12, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Vibrant healthy lush green leaf
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, 300, 300);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(150, 20);
        ctx.lineTo(150, 280);
        ctx.stroke();
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const fakeFile = new File([blob], `sample_${sampleType}.jpg`, { type: 'image/jpeg' });
          setSelectedFile(fakeFile);
          setPreviewUrl(canvas.toDataURL('image/jpeg'));
        }
      }, 'image/jpeg');
    }
  };

  const handleRunInference = async () => {
    if (!selectedCropId) {
      alert('Please select a target crop cycle.');
      return;
    }

    setIsScanning(true);
    try {
      let fileToUpload = selectedFile;
      if (!fileToUpload) {
        // Automatically create a sample leaf capture if user hasn't selected one
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e3a1e';
          ctx.fillRect(0, 0, 300, 300);
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(130, 130, 65, 0, Math.PI * 2);
          ctx.fill();
        }
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg'));
        if (blob) {
          fileToUpload = new File([blob], 'drone_capture_blight.jpg', { type: 'image/jpeg' });
        }
      }

      if (!fileToUpload) return;

      const formData = new FormData();
      formData.append('crop_id', selectedCropId);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('altitude_m', altitude.toString());
      if (activeFlight) {
        formData.append('flight_session_id', activeFlight.id);
      }
      formData.append('image', fileToUpload);

      const result = await api.ingestFrame(formData);
      setCurrentDiagnosis(result.diagnosis);
      await loadCropScans(selectedCropId);
    } catch (err: any) {
      alert(`Inference failed: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="page-content">
      {/* Studio Header & Flight Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('drone_title', 'Autonomous Drone Studio & Multimodal AI Doctor')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('drone_desc', 'Aerial leaf lesion detection, severity quantification, and organic/chemical prescription generator.')}
          </p>
        </div>

        {/* Flight Mission Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeFlight ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="badge badge-success animate-pulse-glow">
                <Activity size={14} />
                <span>{t('flight_active', 'Flight Active')} ({activeFlight.session_code})</span>
              </div>
              <button onClick={handleEndFlight} className="btn-secondary" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                {t('end_flight', 'End Mission')}
              </button>
            </div>
          ) : (
            <button onClick={handleStartFlight} className="btn-primary">
              <Plane size={16} />
              <span>{t('start_flight', 'Initiate Drone Flight Mission')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Flight Telemetry HUD */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GPS Latitude</div>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || 21.1462)}
              className="glass-input font-mono"
              style={{ width: '110px', padding: '4px 8px', fontSize: '0.9rem', color: 'var(--brand-primary)' }}
            />
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GPS Longitude</div>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || 79.0889)}
              className="glass-input font-mono"
              style={{ width: '110px', padding: '4px 8px', fontSize: '0.9rem', color: 'var(--brand-primary)' }}
            />
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Altitude AGL</div>
            <input
              type="number"
              step="0.5"
              value={altitude}
              onChange={(e) => setAltitude(parseFloat(e.target.value) || 15.0)}
              className="glass-input font-mono"
              style={{ width: '90px', padding: '4px 8px', fontSize: '0.9rem', color: 'var(--wheat-gold)' }}
            />
          </div>
        </div>

        {/* Crop Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t('target_crop', 'Target Crop')}:</span>
          <select
            className="glass-input"
            value={selectedCropId}
            onChange={(e) => {
              setSelectedCropId(e.target.value);
              loadCropScans(e.target.value);
            }}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id} style={{ background: 'var(--palette-5)', color: '#fff' }}>
                {c.name} - {c.variety || 'Active'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid: Radar & Image Ingestion + AI Diagnosis */}
      <div className="grid-2">
        {/* Left Card: Dynamic Scanning Radar & Ingestion Hub */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('radar_title', 'Aerial Radar & Frame Capture')}
            </h3>
            <span className="badge badge-info">Gemini 2.5 Vision</span>
          </div>

          {/* Dynamic SVG Radar */}
          <DroneScanRadar
            isScanning={isScanning}
            severity={currentDiagnosis?.severity || 'MEDIUM'}
            quadrantLabel={currentDiagnosis?.affected_quadrant || 'North-East Canopy'}
          />

          {/* Preloaded Sample Selector */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {t('load_samples', 'Load Sample Aerial Drone Captures:')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSelectSample('blight')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px' }}
              >
                {t('sample_blight', 'Foliar Blight')}
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('mildew')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px' }}
              >
                {t('sample_mildew', 'Powdery Mildew')}
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('healthy')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px' }}
              >
                {t('sample_healthy', 'Healthy Leaf')}
              </button>
            </div>
          </div>

          {/* Upload Custom File */}
          <div style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            position: 'relative'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Frame Preview"
                style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--glass-border-hover)' }}
              />
            ) : (
              <Upload size={24} style={{ color: 'var(--brand-primary)', margin: '0 auto 8px' }} />
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {selectedFile ? selectedFile.name : t('upload_frame', 'Upload aerial drone photo or drag & drop')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {t('upload_sub', 'JPEG, PNG up to 25MB • Automated Telemetry Extraction')}
            </div>
          </div>

          {/* Trigger AI Diagnosis Button */}
          <button
            onClick={handleRunInference}
            disabled={isScanning}
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Sparkles size={18} />
            <span>{isScanning ? t('analyzing_btn', 'Ingesting & Analyzing Lesions with AI...') : t('analyze_btn', 'Analyze Frame with Vision AI Doctor')}</span>
          </button>
        </div>

        {/* Right Card: Multimodal AI Diagnosis & Prescription */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('diag_title', 'Plant Pathology Diagnosis')}
            </h3>
            {currentDiagnosis && (
              <span className={`badge badge-${currentDiagnosis.severity.toLowerCase() === 'critical' ? 'critical' : currentDiagnosis.severity.toLowerCase() === 'medium' ? 'warning' : 'success'}`}>
                {currentDiagnosis.severity} Severity
              </span>
            )}
          </div>

          {currentDiagnosis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Pathogen Title & Confidence */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Identified Condition / Pathogen
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentDiagnosis.disease_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${currentDiagnosis.confidence_score}%`, height: '100%', background: 'var(--brand-primary)' }} />
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    {currentDiagnosis.confidence_score}% Confidence
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Canopy Sector: <span style={{ color: 'var(--wheat-gold)' }}>{currentDiagnosis.affected_quadrant}</span>
                </div>
              </div>

              {/* Remedy Toggle Switch */}
              <div>
                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setRemedyTab('organic')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: remedyTab === 'organic' ? 'var(--brand-dim)' : 'transparent',
                      color: remedyTab === 'organic' ? 'var(--brand-primary)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('organic_tab', '🌿 Organic / Bio-Remedy')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemedyTab('chemical')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: remedyTab === 'chemical' ? 'var(--wheat-dim)' : 'transparent',
                      color: remedyTab === 'chemical' ? 'var(--wheat-gold)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('chemical_tab', '🧪 Agrochemical Formulation')}
                  </button>
                </div>

                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: remedyTab === 'organic' ? 'var(--brand-dim)' : 'var(--wheat-dim)',
                  border: remedyTab === 'organic' ? '1px solid var(--glass-border-hover)' : '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  color: 'var(--text-primary)'
                }}>
                  {remedyTab === 'organic' ? currentDiagnosis.organic_remedy : currentDiagnosis.chemical_remedy}
                </div>
              </div>

              {/* 7-Day Field Action Protocol */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--azure-info)' }}>
                  <Calendar size={16} />
                  <span>{t('protocol_7day', '7-Day Preventive Protocol')}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.45 }}>
                  {currentDiagnosis.preventive_plan}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', padding: '40px 0' }}>
              <Plane size={36} style={{ color: 'var(--glass-border)', margin: '0 auto 12px' }} />
              <div>No scans ingested yet for this crop cycle.</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Load a sample capture above or upload a drone frame to trigger analysis.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical Scans Gallery */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          {t('flight_logs', 'Aerial Telemetry & Pathology Flight Logs')} ({scans.length})
        </h3>
        {scans.length > 0 ? (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>GPS Coordinates</th>
                  <th>Altitude</th>
                  <th>Diagnosis</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.captured_at).toLocaleString()}</td>
                    <td className="font-mono">{s.latitude.toFixed(4)}°N, {s.longitude.toFixed(4)}°E</td>
                    <td className="font-mono">{s.altitude_m} m</td>
                    <td style={{ fontWeight: 600 }}>{s.diagnosis?.disease_name || 'Processed'}</td>
                    <td>
                      {s.diagnosis && (
                        <span className={`badge badge-${s.diagnosis.severity.toLowerCase() === 'critical' ? 'critical' : s.diagnosis.severity.toLowerCase() === 'medium' ? 'warning' : 'success'}`}>
                          {s.diagnosis.severity}
                        </span>
                      )}
                    </td>
                    <td className="font-mono">{s.diagnosis?.confidence_score}%</td>
                    <td>
                      <button
                        onClick={() => s.diagnosis && setCurrentDiagnosis(s.diagnosis)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recorded flights yet for this crop cycle.
          </div>
        )}
      </div>
    </div>
  );
};
