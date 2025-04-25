"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  profile_id: string
  first_name: string
  last_name: string
  email: string
  grade: string
  isEnrolled: boolean
}

export default function EnrollStudentsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [courseName, setCourseName] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch course name
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("name, teacher_id")
          .eq("id", courseId)
          .single()

        if (courseError) throw courseError
        setCourseName(courseData.name)

        // Check if user is the teacher of this course or an admin
        if (profile?.role !== "admin" && (profile?.role !== "teacher" || courseData.teacher_id !== user.id)) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to enroll students in this course.",
            variant: "destructive",
          })
          router.push(`/courses/${courseId}`)
          return
        }

        // Fetch all students
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select(`
            id,
            profile:profile_id(
              id,
              first_name,
              last_name,
              email
            ),
            grade
          `)
          .order("grade")

        if (studentsError) throw studentsError

        // Fetch currently enrolled students
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("student_id")
          .eq("course_id", courseId)

        if (enrollmentsError) throw enrollmentsError

        // Create a set of enrolled student IDs for quick lookup
        const enrolledStudentIds = new Set(enrollmentsData.map((e) => e.student_id))

        // Format student data and mark enrolled students
        const formattedStudents = studentsData.map((student) => ({
          id: student.id,
          profile_id: student.profile.id,
          first_name: student.profile.first_name,
          last_name: student.profile.last_name,
          email: student.profile.email,
          grade: student.grade,
          isEnrolled: enrolledStudentIds.has(student.id),
        }))

        setStudents(formattedStudents)
        setFilteredStudents(formattedStudents)

        // Pre-select enrolled students
        setSelectedStudents(formattedStudents.filter((s) => s.isEnrolled).map((s) => s.id))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
        router.push(`/courses/${courseId}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [courseId, user, profile, supabase, toast, router])

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === "") {
      setFilteredStudents(students)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredStudents(
        students.filter(
          (student) =>
            student.first_name.toLowerCase().includes(term) ||
            student.last_name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            student.grade.toLowerCase().includes(term),
        ),
      )
    }
  }, [searchTerm, students])

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      // Deselect all if all are selected
      setSelectedStudents([])
    } else {
      // Select all filtered students
      setSelectedStudents(filteredStudents.map((s) => s.id))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Get currently enrolled students
      const { data: currentEnrollments, error: fetchError } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", courseId)

      if (fetchError) throw fetchError

      const currentlyEnrolled = new Set(currentEnrollments.map((e) => e.student_id))

      // Students to add (selected but not currently enrolled)
      const studentsToAdd = selectedStudents.filter((id) => !currentlyEnrolled.has(id))

      // Students to remove (currently enrolled but not selected)
      const studentsToRemove = Array.from(currentlyEnrolled).filter((id) => !selectedStudents.includes(id as string))

      // Add new enrollments
      if (studentsToAdd.length > 0) {
        const enrollmentsToAdd = studentsToAdd.map((studentId) => ({
          student_id: studentId,
          course_id: courseId,
        }))

        const { error: addError } = await supabase.from("enrollments").insert(enrollmentsToAdd)

        if (addError) throw addError
      }

      // Remove enrollments
      if (studentsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("enrollments")
          .delete()
          .eq("course_id", courseId)
          .in("student_id", studentsToRemove)

        if (removeError) throw removeError
      }

      toast({
        title: "Enrollments updated",
        description: "Student enrollments have been updated successfully.",
      })

      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error updating enrollments:", error)
      toast({
        title: "Failed to update enrollments",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Manage Enrollments</h1>
        <p className="text-muted-foreground">Course: {courseName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enroll Students</CardTitle>
          <CardDescription>Select the students you want to enroll in this course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleSelectAll} className="whitespace-nowrap">
              {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-1 divide-y">
              {filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No students found</div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleToggleStudent(student.id)}
                      />
                      <label htmlFor={`student-${student.id}`} className="flex cursor-pointer flex-col">
                        <span className="font-medium">
                          {student.first_name} {student.last_name}
                        </span>
                        <span className="text-sm text-muted-foreground">{student.email}</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Grade {student.grade}</span>
                      {student.isEnrolled && (
                        <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          <Check className="mr-1 h-3 w-3" />
                          Enrolled
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href={`/courses/${courseId}`}>Cancel</Link>
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Enrollments"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
