"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, FileText, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CoursesPage() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!profile) return

      let query

      if (profile.role === "admin") {
        // Admin sees all courses
        query = supabase
          .from("courses")
          .select(`
            *,
            teachers:teacher_id (
              profile_id,
              profiles:profile_id (first_name, last_name)
            ),
            enrollments:id (
              student_id
            )
          `)
          .order("name")
      } else if (profile.role === "teacher") {
        // Teacher sees their courses
        query = supabase
          .from("courses")
          .select(`
            *,
            enrollments:id (
              student_id
            )
          `)
          .eq("teacher_id", profile.id)
          .order("name")
      } else if (profile.role === "student") {
        // Student sees enrolled courses
        query = supabase
          .from("enrollments")
          .select(`
            courses:course_id (
              *,
              teachers:teacher_id (
                profile_id,
                profiles:profile_id (first_name, last_name)
              )
            )
          `)
          .eq("student_id", profile.id)
          .order("courses.name")
      } else if (profile.role === "parent") {
        // Parent sees children's courses
        const childrenIds = await supabase
          .from("parent_student")
          .select("student_id")
          .eq("parent_id", profile.id)
          .then(({ data }) => data?.map((row) => row.student_id) || [])

        query = supabase
          .from("enrollments")
          .select(`
            student_id,
            courses:course_id (
              *,
              teachers:teacher_id (
                profile_id,
                profiles:profile_id (first_name, last_name)
              )
            ),
            students:student_id (
              profile_id,
              profiles:profile_id (first_name, last_name)
            )
          `)
          .in("student_id", childrenIds)
          .order("courses.name")
      }

      if (query) {
        const { data, error } = await query
        if (!error && data) {
          if (profile.role === "student") {
            setCourses(data.map((item: any) => item.courses))
          } else if (profile.role === "parent") {
            setCourses(
              data.map((item: any) => ({
                ...item.courses,
                student: item.students.profiles,
              })),
            )
          } else {
            setCourses(data)
          }
        }
      }

      setIsLoading(false)
    }

    fetchCourses()
  }, [profile])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            {profile?.role === "admin"
              ? "Manage all courses in the system"
              : profile?.role === "teacher"
                ? "Manage your courses"
                : profile?.role === "student"
                  ? "View your enrolled courses"
                  : "View your children's courses"}
          </p>
        </div>
        {(profile?.role === "admin" || profile?.role === "teacher") && (
          <Button asChild>
            <Link href="/courses/new">Create Course</Link>
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No courses found</h2>
          <p className="mt-2 text-center text-muted-foreground">
            {profile?.role === "admin"
              ? "Get started by creating a new course."
              : profile?.role === "teacher"
                ? "You haven't created any courses yet."
                : profile?.role === "student"
                  ? "You are not enrolled in any courses yet."
                  : "Your children are not enrolled in any courses yet."}
          </p>
          {(profile?.role === "admin" || profile?.role === "teacher") && (
            <Button className="mt-6" asChild>
              <Link href="/courses/new">Create Course</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="h-full overflow-hidden hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>
                    {course.period} • {course.semester} {course.school_year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    {profile?.role === "parent" && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {course.student.first_name} {course.student.last_name}
                        </span>
                      </div>
                    )}
                    {course.teachers && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {course.teachers.profiles.first_name} {course.teachers.profiles.last_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{course.description}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{course.enrollments?.length || 0} Students</Badge>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
