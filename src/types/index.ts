export interface Weld {
  id?: number;
  date: string;
  project_name?: string;
  job_work_order?: string;
  contractor?: string;
  gps_location?: string;
  report_number?: string;
  weather?: string;
  type_fit?: string;
  wps?: string;
  pipe_dia?: string;
  grade_class?: string;
  weld_number?: string;
  welder?: string;
  welder_stencil?: string;
  first_ht_number?: string;
  first_length?: string;
  jt_number?: string;
  second_ht_number?: string;
  second_length?: string;
  pre_heat?: string;
  preheat_temperature?: string;
  vt?: string;
  process?: string;
  nde_number?: string;
  amps?: string;
  volts?: string;
  ipm?: string;
  travel_speed?: string;
  elapsed_time?: string;
  electrode_type?: string;
  electrode_size?: string;
  electrode_manufacturer?: string;
  cover_gas?: string;
  flow_rate?: string;
  weld_cap_height_1?: string;
  weld_cap_height_2?: string;
  weld_cap_height_3?: string;
  weld_cap_height_4?: string;
  weld_cap_height_5?: string;
  weld_cap_height_6?: string;
  root_pass_actual?: string;
  root_pass_required?: string;
  hot_pass_actual?: string;
  hot_pass_required?: string;
  fill_pass_actual?: string;
  fill_pass_required?: string;
  cap_pass_actual?: string;
  cap_pass_required?: string;
  top_actual?: string;
  top_required?: string;
  top_jt_no?: string;
  top_wt_ut?: string;
  top_heat_no?: string;
  top_manufacturer?: string;
  top_length?: string;
  top_grade_class?: string;
  top_seam_type?: string;
  bottom_actual?: string;
  bottom_required?: string;
  bottom_jt_no?: string;
  bottom_wt_ut?: string;
  bottom_heat_no?: string;
  bottom_manufacturer?: string;
  bottom_length?: string;
  bottom_grade_class?: string;
  bottom_seam_type?: string;
  welder_signature?: string;
  inspector_signature?: string;
  inspector_name?: string;
  inspector_company?: string;
  comments?: string;
  image_path?: string;
  custom_fields?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface FieldDefinition {
  id: number;
  field_name: string;
  display_name: string;
  field_type: string;
  is_required: boolean;
  is_editable: boolean;
  field_order: number;
  validation_rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchFilters {
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
