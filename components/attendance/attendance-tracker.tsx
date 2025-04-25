"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  first_name: string
  last_name: string
}

interface AttendanceRecord {
  id: string
  student_id: string
  course_id: string
  date: string
  status: "present" | "absent" | "tardy" | "excused"
}

interface AttendanceTrackerProps {
  courseId: string
  isTeacher: boolean
}

export function AttendanceTracker({ courseId, isTeacher }: AttendanceTrackerProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchAttendanceData = async () => {
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

          // Fetch attendance records for the selected date
          await fetchAttendanceForDate(selectedDate, studentIds)
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast({
          title: "Failed to load attendance data",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendanceData()
  }, [courseId, supabase, toast])

  const fetchAttendanceForDate = async (date: string, studentIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("course_id", courseId)
        .eq("date", date)
        .in("student_id", studentIds)

      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      toast({
        title: "Failed to load attendance records",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    if (students.length > 0) {
      const studentIds = students.map((s) => s.id)
      await fetchAttendanceForDate(date, studentIds)
    }
  }

  const getAttendanceStatus = (studentId: string) => {
    const record = attendanceRecords.find((r) => r.student_id === studentId)
    return record?.status || null
  }

  const updateAttendance = async (studentId: string, status: "present" | "absent" | "tardy" | "excused") => {
    if (!isTeacher) return

    const existingRecord = attendanceRecords.find((r) => r.student_id === studentId)

    try {
      setIsSaving(true)

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase.from("attendance").update({ status }).eq("id", existingRecord.id)

        if (error) throw error

        // Update local state
        setAttendanceRecords((prev) =>
          prev.map((record) => (record.id === existingRecord.id ? { ...record, status } : record)),
        )
      } else {
        // Create new record
        const { data, error } = await supabase
          .from("attendance")
          .insert({
            student_id: studentId,
            course_id: courseId,
            date: selectedDate,
            status,
          })
          .select()
          .single()

        if (error) throw error

        // Update local state
        setAttendanceRecords((prev) => [...prev, data])
      }

      toast({
        title: "Attendance updated",
        description: "The attendance record has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating attendance:", error)
      toast({
        title: "Failed to update attendance",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderStatusBadge = (status: string | null) => {
    if (!status) return null

    switch (status) {
      case "present":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Present</span>
      case "absent":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Absent</span>
      case "tardy":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Tardy</span>
      case "excused":
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Excused</span>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No students enrolled</h3>
        <p className="mt-2 text-sm text-muted-foreground">No students are currently enrolled in this course.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Track and manage student attendance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-md border border-input px-3 py-1"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Student</TableHead>
              <TableHead>Status</TableHead>
              {isTeacher && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const status = getAttendanceStatus(student.id)

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.last_name}, {student.first_name}
                  </TableCell>
                  <TableCell>{renderStatusBadge(status)}</TableCell>
                  {isTeacher && (
                    <TableCell className="text-right">
                      <Select
                        value={status || ""}
                        onValueChange={(value) =>
                          updateAttendance(student.id, value as "present" | "absent" | "tardy" | "excused")
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="tardy">Tardy</SelectItem>
                          <SelectItem value="excused">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
