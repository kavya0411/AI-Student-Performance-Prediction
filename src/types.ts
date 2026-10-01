export type PerformanceGrade = 'Poor' | 'Average' | 'Good' | 'Excellent';

export interface StudentInput {
  student_name: string;
  attendance: number;
  study_hours: number;
  assignment_score: number;
  internal_marks: number;
  previous_score: number;
}

export interface PredictionResult {
  id: string;
  user_id: number;
  student_name: string;
  attendance: number;
  study_hours: number;
  assignment_score: number;
  internal_marks: number;
  previous_score: number;
  performance_score: number;
  prediction: PerformanceGrade;
  confidence: number;
  probabilities: Record<PerformanceGrade, number>;
  recommendations: string[];
  created_at: string;
}

export interface DatasetStudent {
  Student_ID: string;
  Student_Name: string;
  Attendance: number;
  Study_Hours: number;
  Assignment_Score: number;
  Internal_Marks: number;
  Previous_Score: number;
  Performance: PerformanceGrade;
  Calculated_Score: number;
}

export interface ModelMetrics {
  dataset_size: number;
  training_samples: number;
  testing_samples: number;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][]; // 4x4 matrix for Excellent, Good, Average, Poor
  class_names: PerformanceGrade[];
  feature_importance: Record<string, number>;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export interface PythonFileItem {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}
