"use client"

import { useState, useEffect } from "react"
import { Edit, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  first_name: string
  last_name: string
}

interface Assignment {
  id: string
  title: string
  total_points: number
  due_date: string
}

interface Grade {
  id: string
  student_id: string
  assignment_id: string
  points_earned: number | null
}

interface GradebookProps {
  courseId: string
}

export function Gradebook({ courseId }: GradebookProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchGradebookData = async () => {
      setIsLoading(true)
      try {
        // Fetch enrolled students
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("student_id")
          .eq("course_id", courseId)

        if (enrollmentsError) throw enrollmentsError

        if (enrollmentsData.length > 0) {
          const studentIds = enrollmentsData.map((e) => e.student_id)

          // Fetch student profiles
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select(`
              id,
              profile:profile_id(
                first_name,
                last_name
              )
            `)
            .in("id", studentIds)

          if (studentsError) throw studentsError

          // Transform student data
          const formattedStudents = studentsData.map((student) => ({
            id: student.id,
            first_name: student.profile.first_name,
            last_name: student.profile.last_name,
          }))

          setStudents(formattedStudents)
        }

        // Fetch assignments for this course
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("assignments")
          .select("*")
          .eq("course_id", courseId)
          .order("due_date", { ascending: true })

        if (assignmentsError) throw assignmentsError
        setAssignments(assignmentsData)

        // Fetch all grades for this course
        const { data: gradesData, error: gradesError } = await supabase
          .from("grades")
          .select("*")
          .eq("course_id", courseId)

        if (gradesError) throw gradesError
        setGrades(gradesData)
      } catch (error) {
        console.error("Error fetching gradebook data:", error)
        toast({
          title: "Failed to load gradebook",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGradebookData()
  }, [courseId, supabase, toast])

  const getGrade = (studentId: string, assignmentId: string) => {
    return grades.find((g) => g.student_id === studentId && g.assignment_id === assignmentId)
  }

  const startEditing = (studentId: string, assignmentId: string) => {
    const grade = getGrade(studentId, assignmentId)
    setEditingCell({ studentId, assignmentId })
    setEditValue(grade?.points_earned?.toString() || "")
  }

  const cancelEditing = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const saveGrade = async () => {
    if (!editingCell) return

    const { studentId, assignmentId } = editingCell
    const assignment = assignments.find((a) => a.id === assignmentId)

    if (!assignment) return

    const pointsEarned = Number.parseFloat(editValue)

    // Validate input
    if (isNaN(pointsEarned) || pointsEarned < 0 || pointsEarned > assignment.total_points) {
      toast({
        title: "Invalid grade",
        description: `Grade must be between 0 and ${assignment.total_points}`,
        variant: "destructive",
      })
      return
    }

    try {
      const existingGrade = getGrade(studentId, assignmentId)

      if (existingGrade) {
        // Update existing grade
        const { error } = await supabase
          .from("grades")
          .update({
            points_earned: pointsEarned,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingGrade.id)

        if (error) throw error
      } else {
        // Create new grade
        const { error } = await supabase.from("grades").insert({
          student_id: studentId,
          assignment_id: assignmentId,
          course_id: courseId,
          grade_type: "assignment",
          points_earned: pointsEarned,
          points_possible: assignment.total_points,
        })

        if (error) throw error
      }

      // Update submission if it exists
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("id")
        .eq("student_id", studentId)
        .eq("assignment_id", assignmentId)
        .maybeSingle()

      if (submissionError) throw submissionError

      if (submissionData) {
        const { error } = await supabase
          .from("submissions")
          .update({
            points_earned: pointsEarned,
            status: "graded",
            graded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", submissionData.id)

        if (error) throw error
      }

      // Refresh grades
      const { data: updatedGrades, error: gradesError } = await supabase
        .from("grades")
        .select("*")
        .eq("course_id", courseId)

      if (gradesError) throw gradesError
      setGrades(updatedGrades)

      toast({
        title: "Grade saved",
        description: "The grade has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving grade:", error)
      toast({
        title: "Failed to save grade",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setEditingCell(null)
      setEditValue("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (students.length === 0 || assignments.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No data available</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {students.length === 0
            ? "No students are enrolled in this course."
            : "No assignments have been created for this course."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Student</TableHead>
              {assignments.map((assignment) => (
                <TableHead key={assignment.id} className="min-w-[120px] text-center">
                  <div className="space-y-1">
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">{assignment.total_points} pts</div>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Average</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              // Calculate student average
              const studentGrades = grades.filter((g) => g.student_id === student.id)
              const totalEarned = studentGrades.reduce((sum, g) => sum + (g.points_earned || 0), 0)
              const totalPossible = studentGrades.reduce((sum, g) => {
                const assignment = assignments.find((a) => a.id === g.assignment_id)
                return sum + (assignment?.total_points || 0)
              }, 0)

              const average = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : null

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.last_name}, {student.first_name}
                  </TableCell>

                  {assignments.map((assignment) => {
                    const grade = getGrade(student.id, assignment.id)
                    const isEditing =
                      editingCell?.studentId === student.id && editingCell?.assignmentId === assignment.id

                    return (
                      <TableCell key={assignment.id} className="text-center">
                        {isEditing ? (
                          <div className="flex items-center space-x-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 w-16 text-center"
                            />
                            <Button size="icon" variant="ghost" onClick={saveGrade} className="h-8 w-8">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="flex cursor-pointer items-center justify-center space-x-1"
                            onClick={() => startEditing(student.id, assignment.id)}
                          >
                            <span>
                              {grade?.points_earned !== null && grade?.points_earned !== undefined
                                ? `${grade.points_earned}/${assignment.total_points}`
                                : "-"}
                            </span>
                            <Edit className="ml-1 h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                    )
                  })}

                  <TableCell className="text-right">{average !== null ? `${average}%` : "-"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
