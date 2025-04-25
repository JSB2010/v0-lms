"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMobile } from "@/hooks/use-mobile"

// Sample data for the admin dashboard
const adminData = {
  name: "Michael Rodriguez",
  role: "School Administrator",
  stats: {
    students: 1250,
    teachers: 85,
    courses: 120,
    departments: 8,
  },
  recentActivity: [
    { id: 1, action: "New student enrolled", details: "Emma Johnson - Grade 9", time: "10 minutes ago" },
    { id: 2, action: "Course created", details: "AP Computer Science - Fall 2024", time: "1 hour ago" },
    { id: 3, action: "Teacher assigned", details: "Sarah Miller to Biology 101", time: "3 hours ago" },
    { id: 4, action: "System update", details: "Gradebook module updated to v2.3", time: "Yesterday" },
    { id: 5, action: "Payment received", details: "Tuition payment - James Wilson", time: "Yesterday" },
  ],
  departments: [
    { id: 1, name: "Mathematics", teachers: 12, courses: 18, students: 320 },
    { id: 2, name: "Science", teachers: 15, courses: 22, students: 345 },
    { id: 3, name: "English", teachers: 14, courses: 16, students: 310 },
    { id: 4, name: "History", teachers: 10, courses: 14, students: 290 },
    { id: 5, name: "Arts", teachers: 8, courses: 12, students: 220 },
    { id: 6, name: "Physical Education", teachers: 6, courses: 8, students: 280 },
    { id: 7, name: "Foreign Languages", teachers: 12, courses: 18, students: 260 },
    { id: 8, name: "Technology", teachers: 8, courses: 12, students: 225 },
  ],
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMobile()

  const NavItems = () => (
    <>
      <div className="flex items-center gap-2 py-4">
        <User className="h-5 w-5 text-primary" />
        <div className="text-sm font-medium">{adminData.name}</div>
        <div className="ml-auto text-xs text-muted-foreground">{adminData.role}</div>
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
          href="#users"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "users" ? "bg-accent" : ""
          }`}
        >
          <Users className="h-4 w-4" />
          Users
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
          href="#departments"
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "departments" ? "bg-accent" : ""
          }`}
        >
          <FileText className="h-4 w-4" />
          Departments
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
        <Link
          href="#settings"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
            activeTab === "settings" ? "bg-accent" : ""
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
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
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <div className="text-2xl font-bold">{adminData.stats.students}</div>
                    <p className="text-xs text-muted-foreground">Currently enrolled</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminData.stats.teachers}</div>
                    <p className="text-xs text-muted-foreground">Active faculty</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminData.stats.courses}</div>
                    <p className="text-xs text-muted-foreground">Current semester</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Departments</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{adminData.stats.departments}</div>
                    <p className="text-xs text-muted-foreground">Academic departments</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Department Overview</CardTitle>
                    <CardDescription>Student and teacher distribution by department</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminData.departments.slice(0, 5).map((department) => (
                        <div key={department.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{department.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {department.teachers} teachers • {department.courses} courses
                            </p>
                          </div>
                          <div className="text-sm">{department.students} students</div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        View All Departments
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="w-full">Add Student</Button>
                      <Button className="w-full">Add Teacher</Button>
                      <Button className="w-full">Create Course</Button>
                      <Button className="w-full">Send Announcement</Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Database</p>
                        <span className="flex items-center text-sm text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-4 w-4"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Storage</p>
                        <span className="flex items-center text-sm text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-4 w-4"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Authentication</p>
                        <span className="flex items-center text-sm text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-4 w-4"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Operational
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Payment Processing</p>
                        <span className="flex items-center text-sm text-green-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-4 w-4"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          Operational
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex gap-2">
                  <Button>Add User</Button>
                  <Button variant="outline">Import Users</Button>
                </div>
              </div>
              <Tabs defaultValue="students">
                <TabsList>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="parents">Parents</TabsTrigger>
                  <TabsTrigger value="admins">Administrators</TabsTrigger>
                </TabsList>
                <TabsContent value="students" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Student management will be implemented in the next phase.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This will allow you to view, add, edit, and manage student accounts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="teachers" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Teacher management will be implemented in the next phase.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This will allow you to view, add, edit, and manage teacher accounts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="parents" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Parent management will be implemented in the next phase.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This will allow you to view, add, edit, and manage parent accounts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="admins" className="mt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          Administrator management will be implemented in the next phase.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          This will allow you to view, add, edit, and manage administrator accounts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="courses" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Course Management</h2>
                <div className="flex gap-2">
                  <Button>Add Course</Button>
                  <Button variant="outline">Import Courses</Button>
                </div>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Course management will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow you to create, edit, and manage courses, assign teachers, and enroll students.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="departments" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Department Management</h2>
                <Button>Add Department</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {adminData.departments.map((department) => (
                  <Card key={department.id}>
                    <CardHeader>
                      <CardTitle>{department.name}</CardTitle>
                      <CardDescription>
                        {department.teachers} teachers • {department.courses} courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Students</p>
                          <p className="text-sm font-medium">{department.students}</p>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="calendar" className="space-y-4">
              <h2 className="text-2xl font-bold">School Calendar</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Calendar management will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow you to manage school events, academic calendar, and schedules.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="messages" className="space-y-4">
              <h2 className="text-2xl font-bold">Messaging System</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Messaging system will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow communication between administrators, teachers, students, and parents.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">System settings will be implemented in the next phase.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This will allow you to configure system preferences, security settings, and integrations.
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
