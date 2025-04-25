"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, FileText, Home, LogOut, Menu, MessageSquare, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for the student dashboard
const studentData = {
  name: "Kevin Willey",
  grade: "10th Grade",
  courses: [
    { id: 1, name: "Algebra II", teacher: "Ms. Johnson", grade: 92, lastUpdated: "2 days ago" },
    { id: 2, name: "Biology", teacher: "Mr. Smith", grade: 88, lastUpdated: "1 week ago" },
    { id: 3, name: "World History", teacher: "Mrs. Davis", grade: 95, lastUpdated: "3 days ago" },
    { id: 4, name: "English Literature", teacher: "Dr. Wilson", grade: 90, lastUpdated: "Yesterday" },
  ],
  assignments: [
    { id: 1, title: "Quadratic Equations", course: "Algebra II", dueDate: "Tomorrow", status: "Not Started" },
    { id: 2, title: "Cell Structure Essay", course: "Biology", dueDate: "Next Monday", status: "In Progress" },
    { id: 3, title: "World War II Analysis", course: "World History", dueDate: "Friday", status: "Completed" },
    {
      id: 4,
      title: "Macbeth Character Study",
      course: "English Literature",
      dueDate: "Next Wednesday",
      status: "Not Started",
    },
  ],
  announcements: [
    {
      id: 1,
      title: "Spring Break Schedule",
      date: "Today",
      content: "Spring break will be from April 10-17. No classes during this period.",
    },
    {
      id: 2,
      title: "Science Fair Registration",
      date: "Yesterday",
      content: "Registration for the annual science fair is now open. Please sign up by March 15.",
    },
    {
      id: 3,
      title: "Parent-Teacher Conferences",
      date: "3 days ago",
      content: "Parent-teacher conferences will be held next Thursday and Friday. Schedule your appointment online.",
    },
  ],
}

// Calculate GPA based on course grades
const calculateGPA = (courses: typeof studentData.courses) => {
  const totalPoints = courses.reduce((sum, course) => sum + course.grade, 0)
  const gpa = totalPoints / courses.length / 20 // Convert to 4.0 scale
  return gpa.toFixed(2)
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMobile()

  const gpa = calculateGPA(studentData.courses)

  const NavItems = () => (
    <>
      <div className="flex items-center gap-2 py-4">
        <User className="h-5 w-5 text-primary" />
        <div className="text-sm font-medium">{studentData.name}</div>
        <div className="ml-auto text-xs text-muted-foreground">{studentData.grade}</div>
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
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gpa}</div>
                    <p className="text-xs text-muted-foreground">4.0 Scale</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentData.courses.length}</div>
                    <p className="text-xs text-muted-foreground">Current Semester</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentData.assignments.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {studentData.assignments.filter((a) => a.status === "Completed").length} Completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{studentData.announcements.length}</div>
                    <p className="text-xs text-muted-foreground">New This Week</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Grades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentData.courses.map((course) => (
                        <div key={course.id} className="flex items-center">
                          <div className="w-full space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium leading-none">{course.name}</p>
                              <p className="text-sm font-medium">{course.grade}%</p>
                            </div>
                            <Progress value={course.grade} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <p>{course.teacher}</p>
                              <p>Updated {course.lastUpdated}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Assignments</CardTitle>
                    <CardDescription>Tasks due soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentData.assignments
                        .filter((a) => a.status !== "Completed")
                        .map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{assignment.title}</p>
                              <p className="text-xs text-muted-foreground">{assignment.course}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  assignment.status === "Not Started"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {assignment.status}
                              </span>
                              <span className="text-xs text-muted-foreground">{assignment.dueDate}</span>
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
                  <CardDescription>Latest school updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentData.announcements.map((announcement) => (
                      <div key={announcement.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <span className="text-xs text-muted-foreground">{announcement.date}</span>
                        </div>
                        <p className="mt-2 text-sm">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="courses" className="space-y-4">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studentData.courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.name}</CardTitle>
                      <CardDescription>{course.teacher}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Current Grade</p>
                            <p className="text-sm font-medium">{course.grade}%</p>
                          </div>
                          <Progress value={course.grade} className="h-2" />
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Details
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
              <h2 className="text-2xl font-bold">My Assignments</h2>
              <Tabs defaultValue="upcoming">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-4">
                  <div className="space-y-4">
                    {studentData.assignments
                      .filter((a) => a.status !== "Completed")
                      .map((assignment) => (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle>{assignment.title}</CardTitle>
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  assignment.status === "Not Started"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {assignment.status}
                              </span>
                            </div>
                            <CardDescription>{assignment.course}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                              <div className="flex gap-2">
                                <Button size="sm">View</Button>
                                <Button size="sm" variant="outline">
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <div className="space-y-4">
                    {studentData.assignments
                      .filter((a) => a.status === "Completed")
                      .map((assignment) => (
                        <Card key={assignment.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle>{assignment.title}</CardTitle>
                              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {assignment.status}
                              </span>
                            </div>
                            <CardDescription>{assignment.course}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                              <Button size="sm" variant="outline">
                                View Submission
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {studentData.assignments.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle>{assignment.title}</CardTitle>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                assignment.status === "Completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : assignment.status === "Not Started"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          <CardDescription>{assignment.course}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                            <div className="flex gap-2">
                              <Button size="sm">View</Button>
                              {assignment.status !== "Completed" && (
                                <Button size="sm" variant="outline">
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <h2 className="text-2xl font-bold">Calendar</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Calendar view will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will display a calendar with assignments, exams, and school events.
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
                      This will allow communication between students, teachers, and parents.
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
