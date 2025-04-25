"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { CourseContent } from "@/components/courses/course-content"
import { Gradebook } from "@/components/gradebook/gradebook"
import { AttendanceTracker } from "@/components/attendance/attendance-tracker"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select(`
            *,
            teacher:teacher_id(
              id,
              profile:profile_id(
                first_name,
                last_name,
                email
              )
            )
          `)
          .eq("id", courseId)
          .single()

        if (courseError) throw courseError
        setCourse(courseData)

        // Fetch enrolled students
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select(`
            student:student_id(
              id,
              profile:profile_id(
                id,
                first_name,
                last_name,
                email
              ),
              grade,
              graduation_year
            )
          `)
          .eq("course_id", courseId)

        if (enrollmentsError) throw enrollmentsError

        // Transform students data
        const formattedStudents = enrollmentsData.map((enrollment) => ({
          id: enrollment.student.id,
          profile_id: enrollment.student.profile.id,
          first_name: enrollment.student.profile.first_name,
          last_name: enrollment.student.profile.last_name,
          email: enrollment.student.profile.email,
          grade: enrollment.student.grade,
          graduation_year: enrollment.student.graduation_year,
        }))

        setStudents(formattedStudents)

        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("assignments")
          .select("*")
          .eq("course_id", courseId)
          .order("due_date", { ascending: true })

        if (assignmentsError) throw assignmentsError
        setAssignments(assignmentsData)
      } catch (error) {
        console.error("Error fetching course data:", error)
        toast({
          title: "Failed to load course",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, user, supabase, toast])

  const isTeacher = profile?.role === "teacher" && course?.teacher_id === user?.id
  const isAdmin = profile?.role === "admin"
  const canEdit = isTeacher || isAdmin

  if (isLoading) {
    return <CourseDetailSkeleton />
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <h2 className="text-2xl font-bold">Course Not Found</h2>
        <p className="text-muted-foreground">The course you're looking for doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/courses">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{course.name}</h1>
          <p className="text-muted-foreground">
            {course.semester} {course.school_year} • {course.period || "No Period Assigned"}
          </p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/courses/${courseId}/edit`}>Edit Course</Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          {(isTeacher || isAdmin) && <TabsTrigger value="grades">Grades</TabsTrigger>}
          {(isTeacher || isAdmin) && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Teacher</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.teacher.profile.first_name} {course.teacher.profile.last_name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.period ? `Period ${course.period}` : "No schedule information"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Students</span>
                  </div>
                  <span className="font-medium">{students.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>Assignments</span>
                  </div>
                  <span className="font-medium">{assignments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Upcoming Due Dates</span>
                  </div>
                  <span className="font-medium">
                    {assignments.filter((assignment) => new Date(assignment.due_date) > new Date()).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Assignments due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.filter(
                (assignment) =>
                  new Date(assignment.due_date) > new Date() &&
                  new Date(assignment.due_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              ).length === 0 ? (
                <p className="text-center text-muted-foreground">No upcoming assignments</p>
              ) : (
                <div className="space-y-4">
                  {assignments
                    .filter(
                      (assignment) =>
                        new Date(assignment.due_date) > new Date() &&
                        new Date(assignment.due_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    )
                    .map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Assignments</h2>
            {canEdit && (
              <Button asChild>
                <Link href={`/courses/${courseId}/assignments/new`}>Create Assignment</Link>
              </Button>
            )}
          </div>

          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Assignments</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  {canEdit
                    ? "Get started by creating your first assignment."
                    : "No assignments have been created for this course yet."}
                </p>
                {canEdit && (
                  <Button className="mt-4" asChild>
                    <Link href={`/courses/${courseId}/assignments/new`}>Create Assignment</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{assignment.title}</CardTitle>
                    <CardDescription>
                      Due: {new Date(assignment.due_date).toLocaleDateString()} • {assignment.total_points} points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                      )}
                      <Button size="sm" asChild>
                        <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
                          {profile?.role === "student" ? "View & Submit" : "View"}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Students</h2>
            {canEdit && (
              <Button asChild>
                <Link href={`/courses/${courseId}/enroll`}>Enroll Students</Link>
              </Button>
            )}
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Students</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  {canEdit
                    ? "No students are enrolled in this course yet."
                    : "No students are enrolled in this course yet."}
                </p>
                {canEdit && (
                  <Button className="mt-4" asChild>
                    <Link href={`/courses/${courseId}/enroll`}>Enroll Students</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  {students.length} student{students.length !== 1 ? "s" : ""} enrolled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        {canEdit && <p className="text-sm text-muted-foreground">{student.email}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Grade {student.grade}</span>
                        {canEdit && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/students/${student.id}`}>View Profile</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <CourseContent courseId={courseId} isTeacher={canEdit} />
        </TabsContent>

        {(isTeacher || isAdmin) && (
          <TabsContent value="grades" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Gradebook</h2>
            </div>
            <Gradebook courseId={courseId} />
          </TabsContent>
        )}

        {(isTeacher || isAdmin) && (
          <TabsContent value="attendance" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Attendance</h2>
            </div>
            <AttendanceTracker courseId={courseId} isTeacher={true} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}
