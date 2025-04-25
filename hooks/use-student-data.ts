"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/supabase/database.types"

type Student = Database["public"]["Tables"]["students"]["Row"]
type Course = Database["public"]["Tables"]["courses"]["Row"] & {
  teacher: {
    first_name: string
    last_name: string
  }
}
type Assignment = Database["public"]["Tables"]["assignments"]["Row"]
type Grade = Database["public"]["Tables"]["grades"]["Row"]
type Submission = Database["public"]["Tables"]["submissions"]["Row"]
type Announcement = Database["public"]["Tables"]["announcements"]["Row"] & {
  author: {
    first_name: string
    last_name: string
  }
}

export function useStudentData() {
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch student data
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("profile_id", user.id)
          .single()

        if (studentError) throw studentError
        setStudent(studentData)

        // Fetch courses
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", studentData.id)

        if (enrollmentsError) throw enrollmentsError

        if (enrollmentsData.length > 0) {
          const courseIds = enrollmentsData.map((e) => e.course_id)

          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select(`
              *,
              teacher:teacher_id(
                profile:profiles(
                  first_name,
                  last_name
                )
              )
            `)
            .in("id", courseIds)

          if (coursesError) throw coursesError

          // Transform the data to match the expected format
          const formattedCourses = coursesData.map((course) => ({
            ...course,
            teacher: {
              first_name: course.teacher.profile.first_name,
              last_name: course.teacher.profile.last_name,
            },
          }))

          setCourses(formattedCourses)

          // Fetch assignments for these courses
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from("assignments")
            .select("*")
            .in("course_id", courseIds)

          if (assignmentsError) throw assignmentsError
          setAssignments(assignmentsData)

          // Fetch grades
          const { data: gradesData, error: gradesError } = await supabase
            .from("grades")
            .select("*")
            .eq("student_id", studentData.id)

          if (gradesError) throw gradesError
          setGrades(gradesData)

          // Fetch submissions
          const { data: submissionsData, error: submissionsError } = await supabase
            .from("submissions")
            .select("*")
            .eq("student_id", studentData.id)

          if (submissionsError) throw submissionsError
          setSubmissions(submissionsData)
        }

        // Fetch announcements (both course-specific and school-wide)
        const { data: announcementsData, error: announcementsError } = await supabase
          .from("announcements")
          .select(`
            *,
            author:author_id(
              first_name,
              last_name
            )
          `)
          .or(`is_school_wide.eq.true,course_id.in.(${enrollmentsData.map((e) => e.course_id).join(",")})`)
          .order("created_at", { ascending: false })

        if (announcementsError) throw announcementsError
        setAnnouncements(announcementsData)
      } catch (err) {
        console.error("Error fetching student data:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch student data"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentData()
  }, [user, supabase])

  return {
    student,
    courses,
    assignments,
    grades,
    submissions,
    announcements,
    isLoading,
    error,
  }
}
