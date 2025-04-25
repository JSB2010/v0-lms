"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    announcements: 0,
    upcomingEvents: 0,
  })
  const [activities, setActivities] = useState([])
  const [deadlines, setDeadlines] = useState([])

  useEffect(() => {
    if (!profile) return

    // Simple fetch for stats
    async function fetchStats() {
      try {
        // Basic counts only
        const { count: coursesCount } = await supabase.from("courses").select("*", { count: "exact", head: true })

        const { count: assignmentsCount } = await supabase
          .from("assignments")
          .select("*", { count: "exact", head: true })

        const { count: announcementsCount } = await supabase
          .from("announcements")
          .select("*", { count: "exact", head: true })

        const { count: eventsCount } = await supabase
          .from("calendar_events")
          .select("*", { count: "exact", head: true })

        setStats({
          courses: coursesCount || 0,
          assignments: assignmentsCount || 0,
          announcements: announcementsCount || 0,
          upcomingEvents: eventsCount || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    // Simple fetch for activities
    async function fetchActivities() {
      try {
        const { data } = await supabase
          .from("announcements")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        setActivities(data || [])
      } catch (error) {
        console.error("Error fetching activities:", error)
      }
    }

    // Simple fetch for deadlines
    async function fetchDeadlines() {
      try {
        const { data } = await supabase
          .from("assignments")
          .select("id, title, due_date")
          .order("due_date", { ascending: true })
          .limit(5)

        setDeadlines(data || [])
      } catch (error) {
        console.error("Error fetching deadlines:", error)
      }
    }

    fetchStats()
    fetchActivities()
    fetchDeadlines()
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
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assignments">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignments}</div>
              <p className="text-xs text-muted-foreground">Total assignments</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/announcements">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.announcements}</div>
              <p className="text-xs text-muted-foreground">School announcements</p>
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Posted on {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Assignment due dates</CardDescription>
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
                        Due on {new Date(deadline.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
