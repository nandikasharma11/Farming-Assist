export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  state?: string;
  district?: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
}

export interface FarmPlot {
  id: string;
  user_id: string;
  name: string;
  area_acres: number;
  latitude: number;
  longitude: number;
  soil_type?: string;
  created_at: string;
}

export interface UserProfile extends User {
  plots: FarmPlot[];
}

export interface Crop {
  id: string;
  plot_id: string;
  name: string;
  variety?: string;
  sowing_date: string;
  base_temperature_c: number;
  target_gdd: number;
  current_gdd: number;
  current_stage: string;
  status: string;
  created_at: string;
}

export interface GDDCalculation {
  crop_id: string;
  crop_name: string;
  sowing_date: string;
  current_gdd: number;
  target_gdd: number;
  progress_percentage: number;
  current_stage: string;
  daily_history: Array<{
    date: string;
    t_max: number;
    t_min: number;
    daily_gdd: number;
    cumulative_gdd: number;
  }>;
}

export interface KhataTransaction {
  id: string;
  user_id: string;
  crop_id?: string;
  transaction_type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  transaction_date: string;
  description?: string;
  receipt_url?: string;
  created_at: string;
}

export interface KhataSummary {
  total_income: number;
  total_expense: number;
  net_profit: number;
  expense_by_category: Record<string, number>;
  income_by_category: Record<string, number>;
  transaction_count: number;
}

export interface LaborRecord {
  id: string;
  user_id: string;
  crop_id?: string;
  laborer_name: string;
  phone?: string;
  task_type: string;
  daily_wage: number;
  days_worked: number;
  advance_paid: number;
  net_balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'SETTLED';
  created_at: string;
}

export interface KCCReport {
  report_title: string;
  farmer_name: string;
  state?: string;
  district?: string;
  plot_name: string;
  plot_acres: number;
  crop_name: string;
  variety?: string;
  sowing_date: string;
  current_growth_stage: string;
  cumulative_gdd: number;
  total_expenses_incurred: number;
  expenses_breakdown: Record<string, number>;
  labor_dues_pending: number;
  standard_scale_of_finance_per_acre: number;
  eligible_kcc_credit_limit: number;
  generated_at: string;
}

export interface DiseaseDiagnosis {
  id: string;
  scan_id: string;
  disease_name: string;
  confidence_score: number;
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  affected_quadrant: string;
  organic_remedy: string;
  chemical_remedy: string;
  preventive_plan: string;
  raw_inference_metadata: Record<string, any>;
  diagnosed_at: string;
}

export interface DroneScan {
  id: string;
  flight_id?: string;
  crop_id: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  image_path: string;
  captured_at: string;
  diagnosis?: DiseaseDiagnosis;
}

export interface DroneFlight {
  id: string;
  user_id: string;
  session_code: string;
  start_latitude: number;
  start_longitude: number;
  altitude_m: number;
  status: string;
  started_at: string;
  ended_at?: string;
}

export interface MandiRate {
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  trend_pct: number;
  arrival_tons: number;
  msp?: number;
}

export interface DailyWeatherForecast {
  date: string;
  weather_code: number;
  condition: string;
  t_max: number;
  t_min: number;
  precipitation_probability: number;
  precipitation_sum: number;
  wind_speed_max: number;
  spray_status: 'OPTIMAL' | 'CAUTION_WIND' | 'NO_SPRAY' | 'EVENING_ONLY';
  spray_advice: string;
}

export interface WeatherAdvisory {
  latitude: number;
  longitude: number;
  current_temperature: number;
  current_humidity: number;
  current_wind_speed: number;
  current_weather: string;
  spray_status: string;
  spray_rationale: string;
  forecast: DailyWeatherForecast[];
}
