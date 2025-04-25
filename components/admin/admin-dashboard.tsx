"use client"

import { useState, useEffect } from "react"
import { BookOpen, Download, Plus, Search, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type UserRole = Database["public"]["Enums"]["user_role"]

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  created_at: string
}

interface CourseData {
  id: string
  name: string
  teacher_name: string
  school_year: string
  semester: string
  students_count: number
}

interface DepartmentData {
  id: string
  name: string
  teachers_count: number
  courses_count: number
  students_count: number
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [courses, setCourses] = useState<CourseData[]>([])
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    departments: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isAddingDepartment, setIsAddingDepartment] = useState(false)
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "student" as UserRole,
  })
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    teacher_id: "",
    school_year: new Date().getFullYear().toString(),
    semester: "Fall",
  })
  const [newDepartment, setNewDepartment] = useState({
    name: "",
  })
  const [availableTeachers, setAvailableTeachers] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true)
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("last_name", { ascending: true })

        if (usersError) throw usersError
        setUsers(usersData || [])

        // Fetch courses with teacher names and student counts
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(`
            id,
            name,
            school_year,
            semester,
            teacher:teacher_id(
              profile:profile_id(
                first_name,
                last_name
              )
            )
          `)
          .order("name", { ascending: true })

        if (coursesError) throw coursesError

        // Get student counts for each course
        const coursesWithCounts = await Promise.all(
          coursesData.map(async (course) => {
            const { count, error: countError } = await supabase
              .from("enrollments")
              .select("*", { count: "exact", head: true })
              .eq("course_id", course.id)

            if (countError) throw countError

            return {
              id: course.id,
              name: course.name,
              teacher_name: `${course.teacher.profile.first_name} ${course.teacher.profile.last_name}`,
              school_year: course.school_year,
              semester: course.semester,
              students_count: count || 0,
            }
          }),
        )

        setCourses(coursesWithCounts)

        // Fetch departments (this is a mock since we don't have a departments table yet)
        // In a real implementation, you would fetch from a departments table
        const mockDepartments = [
          { id: "1", name: "Mathematics", teachers_count: 5, courses_count: 8, students_count: 120 },
          { id: "2", name: "Science", teachers_count: 6, courses_count: 10, students_count: 150 },
          { id: "3", name: "English", teachers_count: 4, courses_count: 6, students_count: 110 },
          { id: "4", name: "History", teachers_count: 3, courses_count: 5, students_count: 90 },
        ]
        setDepartments(mockDepartments)

        // Calculate stats
        const studentsCount = usersData?.filter((u) => u.role === "student").length || 0
        const teachersCount = usersData?.filter((u) => u.role === "teacher").length || 0

        setStats({
          students: studentsCount,
          teachers: teachersCount,
          courses: coursesData?.length || 0,
          departments: mockDepartments.length,
        })

        // Get available teachers for course creation
        const teachersForSelect =
          usersData
            ?.filter((u) => u.role === "teacher")
            .map((t) => ({
              id: t.id,
              name: `${t.first_name} ${t.last_name}`,
            })) || []

        setAvailableTeachers(teachersForSelect)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [supabase, toast])

  const addUser = async () => {
    if (!newUser.first_name.trim() || !newUser.last_name.trim() || !newUser.email.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, this would create a user in auth and then add to profiles
      // For now, we'll just add to profiles
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: crypto.randomUUID(), // This would normally come from auth
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          role: newUser.role,
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      setUsers([...users, data])

      // Update stats
      setStats((prev) => ({
        ...prev,
        students: newUser.role === "student" ? prev.students + 1 : prev.students,
        teachers: newUser.role === "teacher" ? prev.teachers + 1 : prev.teachers,
      }))

      // Reset form
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        role: "student",
      })
      setIsAddingUser(false)

      toast({
        title: "User added",
        description: "The user has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Failed to add user",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const addCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.teacher_id) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: newCourse.name,
          description: newCourse.description,
          teacher_id: newCourse.teacher_id,
          school_year: newCourse.school_year,
          semester: newCourse.semester,
        })
        .select()
        .single()

      if (error) throw error

      // Get teacher name
      const teacher = availableTeachers.find((t) => t.id === newCourse.teacher_id)

      // Update local state
      setCourses([
        ...courses,
        {
          id: data.id,
          name: data.name,
          teacher_name: teacher?.name || "Unknown",
          school_year: data.school_year,
          semester: data.semester,
          students_count: 0,
        },
      ])

      // Update stats
      setStats((prev) => ({
        ...prev,
        courses: prev.courses + 1,
      }))

      // Reset form
      setNewCourse({
        name: "",
        description: "",
        teacher_id: "",
        school_year: new Date().getFullYear().toString(),
        semester: "Fall",
      })
      setIsAddingCourse(false)

      toast({
        title: "Course added",
        description: "The course has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding course:", error)
      toast({
        title: "Failed to add course",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const addDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a department name",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real implementation, this would add to a departments table
      // For now, we'll just update the local state
      const newDeptId = crypto.randomUUID()

      setDepartments([
        ...departments,
        {
          id: newDeptId,
          name: newDepartment.name,
          teachers_count: 0,
          courses_count: 0,
          students_count: 0,
        },
      ])

      // Update stats
      setStats((prev) => ({
        ...prev,
        departments: prev.departments + 1,
      }))

      // Reset form
      setNewDepartment({
        name: "",
      })
      setIsAddingDepartment(false)

      toast({
        title: "Department added",
        description: "The department has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding department:", error)
      toast({
        title: "Failed to add department",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-xs text-muted-foreground">Active faculty</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses}</div>
            <p className="text-xs text-muted-foreground">Current semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Management</h3>
            <div className="flex items-center space-x-2">
              <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium">
                          First Name
                        </label>
                        <Input
                          id="first-name"
                          value={newUser.first_name}
                          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium">
                          Last Name
                        </label>
                        <Input
                          id="last-name"
                          value={newUser.last_name}
                          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">
                        Role
                      </label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addUser}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="capitalize">{user.role}</span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Management</h3>
            <div className="flex items-center space-x-2">
              <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>Create a new course in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="course-name" className="text-sm font-medium">
                        Course Name
                      </label>
                      <Input
                        id="course-name"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="course-description" className="text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Input
                        id="course-description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="teacher" className="text-sm font-medium">
                        Teacher
                      </label>
                      <Select
                        value={newCourse.teacher_id}
                        onValueChange={(value) => setNewCourse({ ...newCourse, teacher_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="school-year" className="text-sm font-medium">
                          School Year
                        </label>
                        <Input
                          id="school-year"
                          value={newCourse.school_year}
                          onChange={(e) => setNewCourse({ ...newCourse, school_year: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="semester" className="text-sm font-medium">
                          Semester
                        </label>
                        <Select
                          value={newCourse.semester}
                          onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fall">Fall</SelectItem>
                            <SelectItem value="Spring">Spring</SelectItem>
                            <SelectItem value="Summer">Summer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCourse}>Add Course</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>School Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.teacher_name}</TableCell>
                        <TableCell>{course.school_year}</TableCell>
                        <TableCell>{course.semester}</TableCell>
                        <TableCell>{course.students_count}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Department Management</h3>
            <div className="flex items-center space-x-2">
              <Dialog open={isAddingDepartment} onOpenChange={setIsAddingDepartment}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                    <DialogDescription>Create a new academic department.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="department-name" className="text-sm font-medium">
                        Department Name
                      </label>
                      <Input
                        id="department-name"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingDepartment(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addDepartment}>Add Department</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Teachers</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No departments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.teachers_count}</TableCell>
                        <TableCell>{dept.courses_count}</TableCell>
                        <TableCell>{dept.students_count}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
