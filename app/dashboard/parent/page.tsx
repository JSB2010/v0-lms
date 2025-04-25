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

// Sample data for the parent dashboard
const parentData = {
  name: "Robert Johnson",
  children: [
    {
      id: 1,
      name: "Emma Johnson",
      grade: "9th Grade",
      courses: [
        { id: 1, name: "Algebra I", teacher: "Ms. Wilson", grade: 88, lastUpdated: "2 days ago" },
        { id: 2, name: "Biology", teacher: "Mr. Smith", grade: 92, lastUpdated: "1 week ago" },
        { id: 3, name: "World History", teacher: "Mrs. Davis", grade: 85, lastUpdated: "3 days ago" },
        { id: 4, name: "English", teacher: "Dr. Brown", grade: 90, lastUpdated: "Yesterday" },
      ],
      assignments: [
        { id: 1, title: "Linear Equations", course: "Algebra I", dueDate: "Tomorrow", status: "Not Started" },
        { id: 2, title: "Cell Structure Lab Report", course: "Biology", dueDate: "Next Monday", status: "In Progress" },
        {
          id: 3,
          title: "Ancient Civilizations Essay",
          course: "World History",
          dueDate: "Friday",
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      name: "Michael Johnson",
      grade: "6th Grade",
      courses: [
        { id: 1, name: "Mathematics", teacher: "Mr. Garcia", grade: 85, lastUpdated: "3 days ago" },
        { id: 2, name: "Science", teacher: "Ms. Taylor", grade: 90, lastUpdated: "1 week ago" },
        { id: 3, name: "Social Studies", teacher: "Mr. Anderson", grade: 88, lastUpdated: "2 days ago" },
        { id: 4, name: "Language Arts", teacher: "Mrs. Martinez", grade: 92, lastUpdated: "Yesterday" },
      ],
      assignments: [
        { id: 1, title: "Fractions Worksheet", course: "Mathematics", dueDate: "Thursday", status: "Not Started" },
        { id: 2, title: "Weather Patterns Project", course: "Science", dueDate: "Next Tuesday", status: "In Progress" },
        { id: 3, title: "Geography Quiz", course: "Social Studies", dueDate: "Friday", status: "Not Started" },
      ],
    },
  ],
  announcements: [
    {
      id: 1,
      title: "Parent-Teacher Conferences",
      date: "Today",
      content: "Parent-teacher conferences will be held next Thursday and Friday. Schedule your appointment online.",
    },
    {
      id: 2,
      title: "School Fundraiser",
      date: "Yesterday",
      content: "The annual school fundraiser begins next week. Please consider participating to support our programs.",
    },
    {
      id: 3,
      title: "Spring Break Schedule",
      date: "3 days ago",
      content: "Spring break will be from April 10-17. No classes during this period.",
    },
  ],
  payments: [
    { id: 1, description: "Tuition Payment - March", amount: 750, dueDate: "March 15, 2024", status: "Paid" },
    { id: 2, description: "Field Trip - Science Museum", amount: 25, dueDate: "March 20, 2024", status: "Pending" },
    { id: 3, description: "Lunch Account", amount: 100, dueDate: "N/A", status: "Paid" },
  ],
}

// Calculate GPA based on course grades\
const calculateGPA = (courses: typeof parentData.children[0].courses) => {
  const totalPoints = courses.reduce((sum, course) => sum + course.grade, 0)
  const gpa = (totalPoints / courses.length) / 20 // Convert to 4.0 scale
  return gpa.toFixed(2)
}

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [activeChild, setActiveChild] = useState(parentData.children[0].id)
  const isMobile = useMobile()

  const selectedChild = parentData.children.find((child) => child.id === activeChild) || parentData.children[0]
  const gpa = calculateGPA(selectedChild.courses)

  const NavItems = () => (
    <>
      <div className="flex items-center gap-2 py-4">
        <User className="h-5 w-5 text-primary" />
        <div className="text-sm font-medium">{parentData.name}</div>
        <div className="ml-auto text-xs text-muted-foreground">Parent</div>
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
          href="#children"
          onClick={() => setActiveTab("children")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "children" ? "bg-accent" : ""
          }`}
        >
          <Users className="h-4 w-4" />
          Children
        </Link>
        <Link
          href="#grades"
          onClick={() => setActiveTab("grades")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "grades" ? "bg-accent" : ""
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Grades
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
          <div className="mr-4">
            <select
              className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={activeChild}
              onChange={(e) => setActiveChild(Number(e.target.value))}
            >
              {parentData.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
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
                <TabsTrigger value="children">Children</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{selectedChild.name}'s Dashboard</h2>
                <p className="ml-4 text-muted-foreground">{selectedChild.grade}</p>
              </div>
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
                    <div className="text-2xl font-bold">{selectedChild.courses.length}</div>
                    <p className="text-xs text-muted-foreground">Current Semester</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedChild.assignments.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedChild.assignments.filter((a) => a.status === "Completed").length} Completed
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{parentData.announcements.length}</div>
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
                      {selectedChild.courses.map((course) => (
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
                      {selectedChild.assignments
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
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>Recent and upcoming payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parentData.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">Due: {payment.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">${payment.amount}</p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              payment.status === "Paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Payments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="children" className="space-y-4">
              <h2 className="text-2xl font-bold">My Children</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {parentData.children.map((child) => (
                  <Card key={child.id} className={activeChild === child.id ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle>{child.name}</CardTitle>
                      <CardDescription>{child.grade}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">GPA</p>
                            <p className="text-sm font-medium">{calculateGPA(child.courses)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Courses</p>
                            <p className="text-sm font-medium">{child.courses.length}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Assignments</p>
                            <p className="text-sm font-medium">{child.assignments.length}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setActiveChild(child.id)}
                          variant={activeChild === child.id ? "default" : "outline"}
                          className="w-full"
                        >
                          {activeChild === child.id ? "Currently Selected" : "Select"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="grades" className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{selectedChild.name}'s Grades</h2>
                <p className="ml-4 text-muted-foreground">{selectedChild.grade}</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Course Grades</CardTitle>
                  <CardDescription>Current semester grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedChild.courses.map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">{course.teacher}</p>
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
                        <p className="text-xs text-right text-muted-foreground">Updated {course.lastUpdated}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="font-medium">Overall GPA</p>
                      <p className="font-medium">{gpa}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="assignments" className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{selectedChild.name}'s Assignments</h2>
                <p className="ml-4 text-muted-foreground">{selectedChild.grade}</p>
              </div>
              <Tabs defaultValue="upcoming">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-4">
                  <div className="space-y-4">
                    {selectedChild.assignments
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
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <div className="space-y-4">
                    {selectedChild.assignments
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
                    {selectedChild.assignments.map((assignment) => (
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
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <h2 className="text-2xl font-bold">School Calendar</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Calendar view will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will display school events, assignment due dates, and your child's schedule.
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
                      This will allow communication with teachers and school administrators.
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
