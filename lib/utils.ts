import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate GPA based on percentage grades
export function calculateGPA(grades: number[]): number {
  if (grades.length === 0) return 0

  const gradePoints = grades.map((grade) => {
    if (grade >= 90) return 4.0
    if (grade >= 80) return 3.0
    if (grade >= 70) return 2.0
    if (grade >= 60) return 1.0
    return 0.0
  })

  const sum = gradePoints.reduce((total, point) => total + point, 0)
  return Number.parseFloat((sum / gradePoints.length).toFixed(2))
}
