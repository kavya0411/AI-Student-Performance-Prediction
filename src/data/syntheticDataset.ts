import { DatasetStudent, PerformanceGrade } from '../types';

// Deterministic Pseudo-Random Number Generator (Mulberry32) seeded with 42
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function classifyScore(score: number): PerformanceGrade {
  if (score < 40) return 'Poor';
  if (score < 60) return 'Average';
  if (score < 80) return 'Good';
  return 'Excellent';
}

export function calculateAcademicScore(
  attendance: number,
  study_hours: number,
  assignment: number,
  internal: number,
  previous: number
): number {
  const normalizedStudy = Math.min((study_hours / 8) * 100, 100);
  const score =
    attendance * 0.20 +
    normalizedStudy * 0.15 +
    assignment * 0.20 +
    internal * 0.20 +
    previous * 0.25;
  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

export function generateSyntheticDataset(seed = 42, count = 200): DatasetStudent[] {
  const rand = mulberry32(seed);
  const students: DatasetStudent[] = [];

  for (let i = 1; i <= count; i++) {
    // Generate realistic ranges matching Python script
    const attendance = Math.floor(rand() * (100 - 45 + 1)) + 45;
    const studyHours = Math.round((rand() * (8.0 - 1.0) + 1.0) * 10) / 10;
    const assignment = Math.floor(rand() * (100 - 35 + 1)) + 35;
    const internal = Math.floor(rand() * (100 - 35 + 1)) + 35;
    const previous = Math.floor(rand() * (100 - 35 + 1)) + 35;

    const baseScore = calculateAcademicScore(
      attendance,
      studyHours,
      assignment,
      internal,
      previous
    );

    // Small noise between -3 and +3
    const noise = (rand() * 6) - 3;
    const finalScore = Math.max(0, Math.min(100, Math.round((baseScore + noise) * 100) / 100));

    const idStr = String(i).padStart(3, '0');

    students.push({
      Student_ID: `STU${idStr}`,
      Student_Name: `Student_${idStr}`,
      Attendance: attendance,
      Study_Hours: studyHours,
      Assignment_Score: assignment,
      Internal_Marks: internal,
      Previous_Score: previous,
      Performance: classifyScore(finalScore),
      Calculated_Score: finalScore,
    });
  }

  return students;
}

export const DEFAULT_STUDENTS_DATASET = generateSyntheticDataset(42, 200);

export function datasetToCsv(data: DatasetStudent[]): string {
  const headers = [
    'Student_ID',
    'Student_Name',
    'Attendance',
    'Study_Hours',
    'Assignment_Score',
    'Internal_Marks',
    'Previous_Score',
    'Performance',
    'Calculated_Score'
  ];

  const rows = data.map(s => [
    s.Student_ID,
    s.Student_Name,
    s.Attendance,
    s.Study_Hours,
    s.Assignment_Score,
    s.Internal_Marks,
    s.Previous_Score,
    s.Performance,
    s.Calculated_Score
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
