import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Crop, KCCReport, KhataSummary, KhataTransaction, LaborRecord } from '../services/types';
import {
  DollarSign,
  Plus,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  X,
  Printer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const KhataPage: React.FC = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [transactions, setTransactions] = useState<KhataTransaction[]>([]);
  const [summary, setSummary] = useState<KhataSummary | null>(null);
  const [laborRecords, setLaborRecords] = useState<LaborRecord[]>([]);
  const [kccReport, setKccReport] = useState<KCCReport | null>(null);

  // Modals
  const [showTxModal, setShowTxModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showKCCModal, setShowKCCModal] = useState(false);

  // New Transaction Form
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txCategory, setTxCategory] = useState('Fertilizer');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDesc, setTxDesc] = useState('');

  // New Labor Form
  const [laborerName, setLaborerName] = useState('');
  const [laborTask, setLaborTask] = useState('Weeding');
  const [dailyWage, setDailyWage] = useState('400');
  const [daysWorked, setDaysWorked] = useState('2.0');
  const [advancePaid, setAdvancePaid] = useState('0');

  useEffect(() => {
    api.getCrops().then((list) => {
      setCrops(list);
      if (list.length > 0) {
        setSelectedCropId(list[0].id);
        loadKhataData(list[0].id);
      } else {
        loadKhataData();
      }
    });
  }, []);

  const loadKhataData = async (cropId?: string) => {
    try {
      const [txList, sum, labor] = await Promise.all([
        api.getTransactions(cropId),
        api.getSummary(cropId),
        api.getLabor(cropId),
      ]);
      setTransactions(txList);
      setSummary(sum);
      setLaborRecords(labor);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTransaction({
        crop_id: selectedCropId || null,
        transaction_type: txType,
        category: txCategory,
        amount: parseFloat(txAmount),
        transaction_date: txDate,
        description: txDesc,
      });
      setShowTxModal(false);
      setTxAmount('');
      setTxDesc('');
      await loadKhataData(selectedCropId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateLabor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLabor({
        crop_id: selectedCropId || null,
        laborer_name: laborerName,
        task_type: laborTask,
        daily_wage: parseFloat(dailyWage),
        days_worked: parseFloat(daysWorked),
        advance_paid: parseFloat(advancePaid),
      });
      setShowLaborModal(false);
      setLaborerName('');
      setAdvancePaid('0');
      await loadKhataData(selectedCropId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSettleLabor = async (record: LaborRecord) => {
    try {
      const totalDue = record.daily_wage * record.days_worked;
      await api.updateLabor(record.id, { advance_paid: totalDue });
      await loadKhataData(selectedCropId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenKCC = async () => {
    if (!selectedCropId) {
      alert('Please select a crop first');
      return;
    }
    try {
      const report = await api.getKCCReport(selectedCropId);
      setKccReport(report);
      setShowKCCModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="page-content">
      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('khata_title', 'Smart Farm Ledger (Khata) & Labor Payroll')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('khata_desc', 'Double-entry agricultural bookkeeping, labor wage settlement, and Kisan Credit Card compliance.')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedCropId}
            onChange={(e) => {
              setSelectedCropId(e.target.value);
              loadKhataData(e.target.value);
            }}
            className="glass-input"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="" style={{ background: 'var(--palette-5)', color: '#fff' }}>All Farm Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id} style={{ background: 'var(--palette-5)', color: '#fff' }}>
                {c.name} - {c.variety || 'Active'}
              </option>
            ))}
          </select>
          <button onClick={() => setShowTxModal(true)} className="btn-primary">
            <Plus size={16} />
            <span>{t('record_entry', 'Record Entry')}</span>
          </button>
          <button onClick={() => setShowLaborModal(true)} className="btn-secondary">
            <Users size={16} />
            <span>{t('log_labor', 'Log Labor')}</span>
          </button>
          <button onClick={handleOpenKCC} className="btn-secondary" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde68a' }}>
            <FileText size={16} />
            <span>{t('kcc_appraisal', 'KCC Bank Appraisal')}</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('total_rev', 'Total Revenue / Income')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-dim)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '10px' }}>
            ₹{summary ? summary.total_income.toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Harvest sales & government MSP
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('op_expenses', 'Operational Expenses')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--crimson-dim)', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fca5a5', marginTop: '10px' }}>
            ₹{summary ? summary.total_expense.toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Seeds, fertilizer, fuel & agrochemicals
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('net_surplus', 'Net Farm Surplus')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--wheat-dim)', color: 'var(--wheat-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fde68a', marginTop: '10px' }}>
            ₹{summary ? summary.net_profit.toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Net profit across crop cycles
          </div>
        </div>
      </div>

      {/* Double-Entry Transaction Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('tx_log', 'Financial Transactions Log')} ({transactions.length})
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadKhataData(selectedCropId)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Refresh
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.transaction_date}</td>
                    <td>
                      <span className={`badge ${tx.transaction_type === 'INCOME' ? 'badge-success' : 'badge-critical'}`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.category}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tx.description || '-'}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: tx.transaction_type === 'INCOME' ? '#86efac' : '#fca5a5' }}>
                      {tx.transaction_type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No transactions recorded yet. Click "Record Entry" to start logging farm expenses and income.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Labor Sub-Ledger Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Labor Sub-Ledger & Daily Wage Settlements
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Field worker attendance, piece-rate wages, and outstanding dues
            </p>
          </div>
          <button onClick={() => setShowLaborModal(true)} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <Plus size={14} />
            <span>Add Laborer</span>
          </button>
        </div>

        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Task Type</th>
                <th>Daily Wage</th>
                <th>Days Worked</th>
                <th>Advance Paid</th>
                <th>Net Balance Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {laborRecords.length > 0 ? (
                laborRecords.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.laborer_name}</td>
                    <td>{l.task_type}</td>
                    <td className="font-mono">₹{l.daily_wage}</td>
                    <td className="font-mono">{l.days_worked} d</td>
                    <td className="font-mono">₹{l.advance_paid}</td>
                    <td className="font-mono" style={{ fontWeight: 700, color: l.net_balance > 0 ? '#fca5a5' : '#86efac' }}>
                      ₹{l.net_balance}
                    </td>
                    <td>
                      <span className={`badge ${l.status === 'SETTLED' ? 'badge-success' : l.status === 'PARTIAL' ? 'badge-warning' : 'badge-critical'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.net_balance > 0 ? (
                        <button
                          onClick={() => handleSettleLabor(l)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#86efac' }}
                        >
                          Settle Balance
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cleared</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No labor records logged. Click "Log Labor" to record worker attendance and wage advances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Transaction */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Record Farm Ledger Transaction
              </h3>
              <button onClick={() => setShowTxModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: txType === 'EXPENSE' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: txType === 'EXPENSE' ? '#fca5a5' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Expense (Outflow)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: txType === 'INCOME' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: txType === 'INCOME' ? '#86efac' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Income (Inflow)
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  className="glass-input"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                >
                  {txType === 'EXPENSE' ? (
                    <>
                      <option value="Fertilizer">Fertilizer (Urea, DAP, NPK)</option>
                      <option value="Seeds">Certified Seeds</option>
                      <option value="Pesticide">Pesticide / Fungicide Spray</option>
                      <option value="Diesel">Tractor Diesel & Fuel</option>
                      <option value="Machinery">Machinery Rental / Harvester</option>
                      <option value="Labor">Manual Labor Payment</option>
                      <option value="Irrigation">Tube-well Electricity / Water</option>
                      <option value="Other Expense">Other Expense</option>
                    </>
                  ) : (
                    <>
                      <option value="Harvest Sale">Harvest Crop Mandi Sale</option>
                      <option value="Govt Subsidy">PM-Kisan / Govt Subsidy</option>
                      <option value="Contract Advance">Trader Contract Advance</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="glass-input font-mono"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="glass-input"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description / Voucher Note
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. 2 bags Urea from Krishi Seva Kendra"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Transaction to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Labor Record */}
      {showLaborModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Log Farm Laborer Attendance
              </h3>
              <button onClick={() => setShowLaborModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLabor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Laborer / Crew Name
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={laborerName}
                  onChange={(e) => setLaborerName(e.target.value)}
                  placeholder="Kailash Bai"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Field Task Type
                </label>
                <select
                  className="glass-input"
                  value={laborTask}
                  onChange={(e) => setLaborTask(e.target.value)}
                >
                  <option value="Weeding">Manual Weeding (Nindai)</option>
                  <option value="Transplanting">Sapling Transplanting</option>
                  <option value="Spraying">Foliar Spray Application</option>
                  <option value="Harvesting">Cotton / Crop Picking</option>
                  <option value="Pruning">De-topping / Pruning</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Daily Wage (₹)
                  </label>
                  <input
                    type="number"
                    required
                    className="glass-input font-mono"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Days Worked
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    className="glass-input font-mono"
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Advance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    className="glass-input font-mono"
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Labor Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kisan Credit Card (KCC) Loan Appraisal Report */}
      {showKCCModal && kccReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={22} style={{ color: 'var(--wheat-gold)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  KCC Crop Loan Appraisal Sheet
                </h3>
              </div>
              <button onClick={() => setShowKCCModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Borrower Farmer: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{kccReport.farmer_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Location: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{kccReport.district}, {kccReport.state}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Crop & Variety: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{kccReport.crop_name} ({kccReport.variety || 'Standard'})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Plot Acreage: </span>
                  <strong style={{ color: 'var(--emerald-primary)' }}>{kccReport.plot_acres} Acres</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Current Growth Stage: </span>
                  <strong style={{ color: 'var(--wheat-gold)' }}>{kccReport.current_growth_stage} ({Math.round(kccReport.cumulative_gdd)} GDD)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sowing Date: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{kccReport.sowing_date}</strong>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '6px 0' }} />

              {/* Financial Underwriting Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>NABARD Scale of Finance (per acre):</span>
                  <span className="font-mono">₹{kccReport.standard_scale_of_finance_per_acre.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Actual Input Expenses Logged:</span>
                  <span className="font-mono" style={{ color: '#fca5a5' }}>₹{kccReport.total_expenses_incurred.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending Labor Liability:</span>
                  <span className="font-mono" style={{ color: '#fca5a5' }}>₹{kccReport.labor_dues_pending.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{
                background: 'var(--wheat-dim)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: 600, textTransform: 'uppercase' }}>
                    Eligible Kisan Credit Card (KCC) Limit
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Scale of Finance × Acreage + 10% post-harvest + 20% repairs
                  </div>
                </div>
                <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fde68a' }}>
                  ₹{kccReport.eligible_kcc_credit_limit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                <Printer size={16} />
                <span>Print Bank Underwriting Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
