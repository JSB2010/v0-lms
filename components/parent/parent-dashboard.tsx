"use client"

import { useState, useEffect } from "react"
import { BookOpen, FileText, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface Child {
  id: string
  first_name: string
  last_name: string
  grade: string
}

interface Course {
  id: string
  name: string
  teacher_name: string
  grade: number
  last_updated: string
}

interface Assignment {
  id: string
  title: string
  course_name: string
  due_date: string
  status: string
}

interface Payment {
  id: string
  description: string
  amount: number
  due_date: string | null
  status: string
}

export function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchParentData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch parent record
        const { data: parentData, error: parentError } = await supabase
          .from("parents")
          .select("id")
          .eq("profile_id", user.id)
          .single()

        if (parentError) throw parentError

        // Fetch children
        const { data: childrenData, error: childrenError } = await supabase
          .from("parent_student")
          .select(`
            student:student_id(
              id,
              profile:profile_id(
                first_name,
                last_name
              ),
              grade
            )
          `)
          .eq("parent_id", parentData.id)

        if (childrenError) throw childrenError

        // Transform children data
        const formattedChildren = childrenData.map((item) => ({
          id: item.student.id,
          first_name: item.student.profile.first_name,
          last_name: item.student.profile.last_name,
          grade: item.student.grade,
        }))

        setChildren(formattedChildren)

        if (formattedChildren.length > 0) {
          setSelectedChild(formattedChildren[0].id)
        }
      } catch (error) {
        console.error("Error fetching parent data:", error)
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchParentData()
  }, [user, supabase, toast])

  useEffect(() => {
    const fetchChildData = async () => {
      if (!selectedChild) return

      try {
        // Fetch courses
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", selectedChild)

        if (enrollmentsError) throw enrollmentsError

        if (enrollmentsData.length > 0) {
          const courseIds = enrollmentsData.map((e) => e.course_id)

          // Fetch course details
          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select(`
              id,
              name,
              teacher:teacher_id(
                profile:profile_id(
                  first_name,
                  last_name
                )
              )
            `)
            .in("id", courseIds)

          if (coursesError) throw coursesError

          // Fetch grades for each course
          const formattedCourses = await Promise.all(
            coursesData.map(async (course) => {
              const { data: gradesData, error: gradesError } = await supabase
                .from("grades")
                .select("points_earned, points_possible, updated_at")
                .eq("student_id", selectedChild)
                .eq("course_id", course.id)
                .order("updated_at", { ascending: false })

              if (gradesError) throw gradesError

              // Calculate average grade
              let grade = 0
              let lastUpdated = ""

              if (gradesData && gradesData.length > 0) {
                const totalEarned = gradesData.reduce((sum, g) => sum + (g.points_earned || 0), 0)
                const totalPossible = gradesData.reduce((sum, g) => sum + (g.points_possible || 0), 0)

                grade = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0

                lastUpdated = gradesData[0].updated_at
              }

              return {
                id: course.id,
                name: course.name,
                teacher_name: `${course.teacher.profile.first_name} ${course.teacher.profile.last_name}`,
                grade,
                last_updated: lastUpdated,
              }
            }),
          )

          setCourses(formattedCourses)

          // Fetch assignments
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from("assignments")
            .select(`
              id,
              title,
              course:course_id(name),
              due_date,
              submissions!inner(
                status,
                student_id
              )
            `)
            .in("course_id", courseIds)
            .eq("submissions.student_id", selectedChild)
            .order("due_date", { ascending: false })

          if (assignmentsError) throw assignmentsError

          const formattedAssignments = assignmentsData.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            course_name: assignment.course.name,
            due_date: assignment.due_date,
            status: assignment.submissions[0].status,
          }))

          setAssignments(formattedAssignments)
        }

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("student_id", selectedChild)
          .order("due_date", { ascending: false })

        if (paymentsError) throw paymentsError
        setPayments(paymentsData)
      } catch (error) {
        console.error("Error fetching child data:", error)
        toast({
          title: "Failed to load student data",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      }
    }

    if (selectedChild) {
      fetchChildData()
    }
  }, [selectedChild, supabase, toast])

  const calculateGPA = (courses: Course[]) => {
    if (courses.length === 0) return "0.00"

    const gradePoints = courses.map((course) => {
      if (course.grade >= 90) return 4.0
      if (course.grade >= 80) return 3.0
      if (course.grade >= 70) return 2.0
      if (course.grade >= 60) return 1.0
      return 0.0
    })

    const sum = gradePoints.reduce((total, point) => total + point, 0)
    return (sum / gradePoints.length).toFixed(2)
  }

  const getChildName = () => {
    if (!selectedChild) return ""
    const child = children.find((c) => c.id === selectedChild)
    return child ? `${child.first_name} ${child.last_name}` : ""
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Students Found</CardTitle>
          <CardDescription>You don't have any students associated with your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please contact the school administration to link your children to your account.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Parent Dashboard</h2>
        <Select value={selectedChild || ""} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChild && (
        <>
          <div className="flex items-center">
            <h3 className="text-xl font-semibold">{getChildName()}'s Dashboard</h3>
            <span className="ml-2 text-muted-foreground">{children.find((c) => c.id === selectedChild)?.grade}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateGPA(courses)}</div>
                <p className="text-xs text-muted-foreground">4.0 Scale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">Current Semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {assignments.filter((a) => a.status === "completed" || a.status === "graded").length} Completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Unread Messages</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="grades" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Grades</CardTitle>
                  <CardDescription>Current semester grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {courses.length === 0 ? (
                      <p className="text-center text-muted-foreground">No courses found</p>
                    ) : (
                      courses.map((course) => (
                        <div key={course.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{course.name}</h3>
                              <p className="text-sm text-muted-foreground">{course.teacher_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{course.grade}%</p>
                              <p className="text-sm text-muted-foreground">
                                {course.grade >= 90
                                  ? "A"
                                  : course.grade >= 80
                                    ? "B"
                                    : course.grade >= 70
                                      ? "C"
                                      : course.grade >= 60
                                        ? "D"
                                        : "F"}
                              </p>
                            </div>
                          </div>
                          <Progress value={course.grade} className="h-2" />
                          {course.last_updated && (
                            <p className="text-xs text-right text-muted-foreground">
                              Updated {new Date(course.last_updated).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}

                    {courses.length > 0 && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <p className="font-medium">Overall GPA</p>
                        <p className="font-medium">{calculateGPA(courses)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assignments</CardTitle>
                  <CardDescription>Recent and upcoming assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.length === 0 ? (
                      <p className="text-center text-muted-foreground">No assignments found</p>
                    ) : (
                      assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">{assignment.course_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                assignment.status === "completed" || assignment.status === "graded"
                                  ? "bg-green-100 text-green-800"
                                  : assignment.status === "submitted" || assignment.status === "resubmitted"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance</CardTitle>
                  <CardDescription>Attendance records for the current semester</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">Attendance records will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Recent and upcoming payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.length === 0 ? (
                      <p className="text-center text-muted-foreground">No payments found</p>
                    ) : (
                      payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            {payment.due_date && (
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(payment.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">${payment.amount.toFixed(2)}</p>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                payment.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
