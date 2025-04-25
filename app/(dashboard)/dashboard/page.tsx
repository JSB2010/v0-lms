"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, FileText, Users, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    announcements: 0,
    upcomingEvents: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return

      if (profile.role === "admin") {
        // Admin dashboard data
        const { count: coursesCount } = await supabase.from("courses").select("*", { count: "exact", head: true })

        const { count: announcementsCount } = await supabase
          .from("announcements")
          .select("*", { count: "exact", head: true })

        const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        const { count: eventsCount } = await supabase
          .from("calendar_events")
          .select("*", { count: "exact", head: true })
          .gte("start_date", new Date().toISOString())

        setStats({
          courses: coursesCount || 0,
          assignments: usersCount || 0, // For admin, show users count instead
          announcements: announcementsCount || 0,
          upcomingEvents: eventsCount || 0,
        })
      } else if (profile.role === "teacher") {
        // Teacher dashboard data
        const { count: coursesCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("teacher_id", profile.id)

        const { count: assignmentsCount } = await supabase
          .from("assignments")
          .select("assignments.id", { count: "exact", head: true })
          .eq("courses.teacher_id", profile.id)
          .join("courses", { "assignments.course_id": "courses.id" })

        const { count: announcementsCount } = await supabase
          .from("announcements")
          .select("*", { count: "exact", head: true })
          .eq("author_id", profile.id)

        const { count: eventsCount } = await supabase
          .from("calendar_events")
          .select("*", { count: "exact", head: true })
          .gte("start_date", new Date().toISOString())
          .or(
            `course_id.in.(${supabase
              .from("courses")
              .select("id")
              .eq("teacher_id", profile.id)}),created_by.eq.${profile.id}`,
          )

        setStats({
          courses: coursesCount || 0,
          assignments: assignmentsCount || 0,
          announcements: announcementsCount || 0,
          upcomingEvents: eventsCount || 0,
        })
      } else if (profile.role === "student") {
        // Student dashboard data
        const { data: enrollments, count: coursesCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact" })
          .eq("student_id", profile.id)

        const courseIds = enrollments?.map((e) => e.course_id) || []

        const { count: assignmentsCount } = await supabase
          .from("assignments")
          .select("id", { count: "exact", head: true })
          .in("course_id", courseIds)

        const { count: submissionsCount } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("student_id", profile.id)

        const { count: eventsCount } = await supabase
          .from("calendar_events")
          .select("*", { count: "exact", head: true })
          .gte("start_date", new Date().toISOString())
          .or(`course_id.in.(${courseIds.map((id) => `'${id}'`).join(",")}),course_id.is.null`)

        setStats({
          courses: coursesCount || 0,
          assignments: assignmentsCount || 0,
          announcements: submissionsCount || 0, // For students, show submissions instead
          upcomingEvents: eventsCount || 0,
        })
      } else if (profile.role === "parent") {
        // Parent dashboard data
        const { data: parentStudentRelations } = await supabase
          .from("parent_student")
          .select("student_id")
          .eq("parent_id", profile.id)

        const childrenIds = parentStudentRelations?.map((ps) => ps.student_id) || []

        if (childrenIds.length > 0) {
          const { data: enrollments, count: coursesCount } = await supabase
            .from("enrollments")
            .select("*", { count: "exact" })
            .in("student_id", childrenIds)

          const courseIds = enrollments?.map((e) => e.course_id) || []

          const { count: assignmentsCount } = await supabase
            .from("assignments")
            .select("id", { count: "exact", head: true })
            .in("course_id", courseIds)

          const { count: gradesCount } = await supabase
            .from("grades")
            .select("*", { count: "exact", head: true })
            .in("student_id", childrenIds)

          const { count: eventsCount } = await supabase
            .from("calendar_events")
            .select("*", { count: "exact", head: true })
            .gte("start_date", new Date().toISOString())
            .or(`course_id.in.(${courseIds.map((id) => `'${id}'`).join(",")}),course_id.is.null`)

          setStats({
            courses: coursesCount || 0,
            assignments: assignmentsCount || 0,
            announcements: gradesCount || 0, // For parents, show grades instead
            upcomingEvents: eventsCount || 0,
          })
        }
      }
    }

    fetchDashboardData()
  }, [profile])

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.first_name} {profile.last_name}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/courses">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {profile.role === "admin" || profile.role === "teacher" ? "Total Courses" : "My Courses"}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === "admin"
                  ? "All courses in the system"
                  : profile.role === "teacher"
                    ? "Courses you teach"
                    : profile.role === "student"
                      ? "Courses you are enrolled in"
                      : "Your children's courses"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={profile.role === "admin" ? "/users" : "/assignments"}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {profile.role === "admin" ? "Total Users" : "Assignments"}
              </CardTitle>
              {profile.role === "admin" ? (
                <Users className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignments}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === "admin"
                  ? "All users in the system"
                  : profile.role === "teacher"
                    ? "Assignments you created"
                    : profile.role === "student"
                      ? "Assignments due"
                      : "Your children's assignments"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={profile.role === "student" ? "/submissions" : profile.role === "parent" ? "/grades" : "/announcements"}
        >
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {profile.role === "student" ? "Submissions" : profile.role === "parent" ? "Grades" : "Announcements"}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.announcements}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === "student"
                  ? "Your submitted assignments"
                  : profile.role === "parent"
                    ? "Your children's grades"
                    : profile.role === "teacher"
                      ? "Announcements you posted"
                      : "All announcements"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events in the next 30 days</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity profile={profile} />
        <UpcomingDeadlines profile={profile} />
      </div>
    </div>
  )
}

function RecentActivity({ profile }: { profile: any }) {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!profile) return

      let query

      if (profile.role === "admin") {
        // Admin sees all recent announcements
        query = supabase
          .from("announcements")
          .select(`
            id,
            title,
            created_at,
            author_id,
            profiles:author_id (first_name, last_name)
          `)
          .order("created_at", { ascending: false })
          .limit(5)
      } else if (profile.role === "teacher") {
        // Teacher sees recent submissions to their assignments
        const { data: teacherCourses } = await supabase.from("courses").select("id").eq("teacher_id", profile.id)

        const courseIds = teacherCourses?.map((c) => c.id) || []

        if (courseIds.length > 0) {
          query = supabase
            .from("submissions")
            .select(`
              id,
              status,
              created_at,
              student_id,
              assignment_id,
              students:student_id (profile_id),
              profiles:students (first_name, last_name),
              assignments:assignment_id (title, course_id),
              courses:assignments (name)
            `)
            .in("assignments.course_id", courseIds)
            .order("created_at", { ascending: false })
            .limit(5)
        }
      } else if (profile.role === "student") {
        // Student sees recent grades
        query = supabase
          .from("grades")
          .select(`
            id,
            grade_type,
            points_earned,
            points_possible,
            created_at,
            course_id,
            courses:course_id (name)
          `)
          .eq("student_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(5)
      } else if (profile.role === "parent") {
        // Parent sees children's recent grades
        const childrenIds = await supabase
          .from("parent_student")
          .select("student_id")
          .eq("parent_id", profile.id)
          .then(({ data }) => data?.map((row) => row.student_id) || [])

        query = supabase
          .from("grades")
          .select(`
            id,
            grade_type,
            points_earned,
            points_possible,
            created_at,
            student_id,
            course_id,
            students:student_id (profile_id),
            profiles:students (first_name, last_name),
            courses:course_id (name)
          `)
          .in("student_id", childrenIds)
          .order("created_at", { ascending: false })
          .limit(5)
      }

      if (query) {
        const { data, error } = await query
        if (!error && data) {
          setActivities(data)
        }
      }
    }

    fetchRecentActivity()
  }, [profile])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          {profile.role === "admin"
            ? "Recent announcements"
            : profile.role === "teacher"
              ? "Recent submissions"
              : profile.role === "student"
                ? "Recent grades"
                : "Your children's recent grades"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            activities.map((activity) => {
              if (profile.role === "admin") {
                // Admin sees announcements
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Posted by {activity.profiles.first_name} {activity.profiles.last_name} on{" "}
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              } else if (profile.role === "teacher") {
                // Teacher sees submissions
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.profiles.first_name} {activity.profiles.last_name} submitted{" "}
                        {activity.assignments.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        For {activity.courses.name} on {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              } else if (profile.role === "student") {
                // Student sees grades
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.courses.name} - {activity.grade_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Score: {activity.points_earned}/{activity.points_possible} on{" "}
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              } else if (profile.role === "parent") {
                // Parent sees children's grades
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.profiles.first_name} {activity.profiles.last_name} - {activity.courses.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.grade_type}: {activity.points_earned}/{activity.points_possible} on{" "}
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              }
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UpcomingDeadlines({ profile }: { profile: any }) {
  const [deadlines, setDeadlines] = useState<any[]>([])

  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      if (!profile) return

      let query

      if (profile.role === "admin") {
        // Admin sees all upcoming events
        query = supabase
          .from("calendar_events")
          .select(`
            id,
            title,
            start_date,
            event_type,
            course_id,
            courses:course_id (name)
          `)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(5)
      } else if (profile.role === "teacher") {
        // Teacher sees upcoming assignment deadlines for their courses
        query = supabase
          .from("assignments")
          .select(`
            id,
            title,
            due_date,
            course_id,
            courses:course_id (name)
          `)
          .eq("courses.teacher_id", profile.id)
          .gte("due_date", new Date().toISOString())
          .order("due_date", { ascending: true })
          .limit(5)
      } else if (profile.role === "student") {
        // Student sees upcoming assignment deadlines
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", profile.id)

        const courseIds = enrollments?.map((e) => e.course_id) || []

        query = supabase
          .from("assignments")
          .select(`
            id,
            title,
            due_date,
            course_id,
            courses:course_id (name)
          `)
          .in("course_id", courseIds)
          .gte("due_date", new Date().toISOString())
          .order("due_date", { ascending: true })
          .limit(5)
      } else if (profile.role === "parent") {
        // Parent sees children's upcoming assignment deadlines
        const { data: parentStudentRelations } = await supabase
          .from("parent_student")
          .select("student_id")
          .eq("parent_id", profile.id)

        const childrenIds = parentStudentRelations?.map((ps) => ps.student_id) || []

        if (childrenIds.length > 0) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("course_id")
            .in("student_id", childrenIds)

          const courseIds = enrollments?.map((e) => e.course_id) || []

          query = supabase
            .from("assignments")
            .select(`
              id,
              title,
              due_date,
              course_id,
              courses:course_id (name)
            `)
            .in("course_id", courseIds)
            .gte("due_date", new Date().toISOString())
            .order("due_date", { ascending: true })
            .limit(5)
        }
      }

      if (query) {
        const { data, error } = await query
        if (!error && data) {
          setDeadlines(data)
        }
      }
    }

    fetchUpcomingDeadlines()
  }, [profile])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
        <CardDescription>
          {profile.role === "admin" ? "Upcoming events" : "Upcoming assignment deadlines"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
          ) : (
            deadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{deadline.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {deadline.courses?.name && `${deadline.courses.name} - `}
                    Due on {new Date(deadline.due_date || deadline.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
