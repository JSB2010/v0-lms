"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, FileText, Home, LogOut, Menu, MessageSquare, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for the teacher dashboard
const teacherData = {
  name: "Sarah Johnson",
  department: "Mathematics",
  courses: [
    { id: 1, name: "Algebra II", period: "1st Period", students: 28, averageGrade: 85 },
    { id: 2, name: "Geometry", period: "3rd Period", students: 24, averageGrade: 82 },
    { id: 3, name: "Pre-Calculus", period: "5th Period", students: 22, averageGrade: 79 },
    { id: 4, name: "AP Calculus", period: "7th Period", students: 18, averageGrade: 91 },
  ],
  assignments: [
    { id: 1, title: "Quadratic Equations Quiz", course: "Algebra II", dueDate: "Tomorrow", submissions: 15, total: 28 },
    { id: 2, title: "Geometry Proofs Worksheet", course: "Geometry", dueDate: "Friday", submissions: 20, total: 24 },
    { id: 3, title: "Trigonometry Test", course: "Pre-Calculus", dueDate: "Next Monday", submissions: 0, total: 22 },
    { id: 4, title: "Limits Problem Set", course: "AP Calculus", dueDate: "Wednesday", submissions: 12, total: 18 },
  ],
  announcements: [
    {
      id: 1,
      title: "Math Department Meeting",
      date: "Today",
      content: "Reminder: Math department meeting after school in room 203.",
    },
    {
      id: 2,
      title: "Tutoring Schedule",
      date: "Yesterday",
      content: "Tutoring will be available every Tuesday and Thursday after school.",
    },
    {
      id: 3,
      title: "Math Competition",
      date: "3 days ago",
      content: "Sign-ups for the regional math competition are due by next Friday.",
    },
  ],
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMobile()

  const totalStudents = teacherData.courses.reduce((sum, course) => sum + course.students, 0)

  const NavItems = () => (
    <>
      <div className="flex items-center gap-2 py-4">
        <User className="h-5 w-5 text-primary" />
        <div className="text-sm font-medium">{teacherData.name}</div>
        <div className="ml-auto text-xs text-muted-foreground">{teacherData.department}</div>
      </div>
      <nav className="grid gap-1">
        <Link
          href="#overview"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "overview" ? "bg-accent" : ""
          }`}
        >
          <Home className="h-4 w-4" />
          Overview
        </Link>
        <Link
          href="#courses"
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "courses" ? "bg-accent" : ""
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Courses
        </Link>
        <Link
          href="#assignments"
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "assignments" ? "bg-accent" : ""
          }`}
        >
          <FileText className="h-4 w-4" />
          Assignments
        </Link>
        <Link
          href="#students"
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "students" ? "bg-accent" : ""
          }`}
        >
          <Users className="h-4 w-4" />
          Students
        </Link>
        <Link
          href="#calendar"
          onClick={() => setActiveTab("calendar")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "calendar" ? "bg-accent" : ""
          }`}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </Link>
        <Link
          href="#messages"
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "messages" ? "bg-accent" : ""
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Messages
        </Link>
      </nav>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 sm:w-80">
                <NavItems />
              </SheetContent>
            </Sheet>
          )}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SchoolSync</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-1">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </Link>
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        {!isMobile && (
          <aside className="border-r bg-muted/40 md:block">
            <div className="sticky top-16 overflow-y-auto p-4">
              <NavItems />
            </div>
          </aside>
        )}
        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Across all courses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherData.courses.length}</div>
                    <p className="text-xs text-muted-foreground">Current Semester</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherData.assignments.length}</div>
                    <p className="text-xs text-muted-foreground">Active assignments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teacherData.announcements.length}</div>
                    <p className="text-xs text-muted-foreground">Posted this week</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>Average grades across all courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teacherData.courses.map((course) => (
                        <div key={course.id} className="flex items-center">
                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium leading-none">{course.name}</p>
                              <p className="text-sm font-medium">{course.averageGrade}%</p>
                            </div>
                            <Progress value={course.averageGrade} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <p>{course.period}</p>
                              <p>{course.students} students</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Assignment Status</CardTitle>
                    <CardDescription>Submission rates for current assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teacherData.assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.course}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {assignment.submissions}/{assignment.total} submitted
                            </span>
                            <span className="text-xs text-muted-foreground">Due: {assignment.dueDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Recent announcements to your classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teacherData.announcements.map((announcement) => (
                      <div key={announcement.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        </div>
                        <p className="mt-2 text-sm">{announcement.content}</p>
                      </div>
                    ))}
                    <Button className="w-full">Create New Announcement</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="courses" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Courses</h2>
                <Button>Add New Course</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teacherData.courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.name}</CardTitle>
                      <CardDescription>
                        {course.period} • {course.students} students
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Average Grade</p>
                            <p className="text-sm font-medium">{course.averageGrade}%</p>
                          </div>
                          <Progress value={course.averageGrade} className="h-2" />
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Roster
                          </Button>
                          <Button variant="outline" size="sm">
                            Assignments
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="assignments" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Assignments</h2>
                <Button>Create Assignment</Button>
              </div>
              <Tabs defaultValue="active">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="grading">Needs Grading</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-4">
                  <div className="space-y-4">
                    {teacherData.assignments.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle>{assignment.title}</CardTitle>
                            <span className="text-sm text-muted-foreground">
                              {assignment.submissions}/{assignment.total} submitted
                            </span>
                          </div>
                          <CardDescription>{assignment.course}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                            <div className="flex gap-2">
                              <Button size="sm">View Submissions</Button>
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="grading" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">No assignments currently need grading.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="past" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">Past assignments will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="students" className="space-y-4">
              <h2 className="text-2xl font-bold">Students</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Student management will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow you to view and manage student information, grades, and performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <h2 className="text-2xl font-bold">Calendar</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Calendar view will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will display your schedule, assignment due dates, and school events.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="messages" className="space-y-4">
              <h2 className="text-2xl font-bold">Messages</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Messaging system will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow communication with students, parents, and other teachers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
