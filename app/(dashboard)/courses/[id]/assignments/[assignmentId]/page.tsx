"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { AssignmentDetails } from "@/components/assignments/assignment-details"

export default function AssignmentDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const assignmentId = params.assignmentId as string
  const [assignment, setAssignment] = useState<any>(null)
  const [courseName, setCourseName] = useState("")
  const [submission, setSubmission] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignments")
          .select("*")
          .eq("id", assignmentId)
          .eq("course_id", courseId)
          .single()

        if (assignmentError) throw assignmentError
        setAssignment(assignmentData)

        // Fetch course name
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("name")
          .eq("id", courseId)
          .single()

        if (courseError) throw courseError
        setCourseName(courseData.name)

        // If student, fetch their submission
        if (profile?.role === "student") {
          // First get student ID
          const { data: studentData, error: studentError } = await supabase
            .from("students")
            .select("id")
            .eq("profile_id", user.id)
            .single()

          if (studentError && studentError.code !== "PGRST116") {
            // PGRST116 is "no rows returned" - this is fine if the user is not a student
            throw studentError
          }

          if (studentData) {
            const { data: submissionData, error: submissionError } = await supabase
              .from("submissions")
              .select("*")
              .eq("assignment_id", assignmentId)
              .eq("student_id", studentData.id)
              .maybeSingle()

            if (submissionError) throw submissionError
            setSubmission(submissionData)
          }
        }
      } catch (error) {
        console.error("Error fetching assignment data:", error)
        toast({
          title: "Failed to load assignment",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
        router.push(`/courses/${courseId}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignmentData()
  }, [assignmentId, courseId, user, profile, supabase, toast, router])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <h2 className="text-2xl font-bold">Assignment Not Found</h2>
        <p className="text-muted-foreground">
          The assignment you're looking for doesn't exist or you don't have access.
        </p>
        <Button asChild>
          <Link href={`/courses/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    )
  }

  // Get student ID for submission component
  const getStudentId = async () => {
    if (profile?.role !== "student") return null

    const { data } = await supabase.from("students").select("id").eq("profile_id", user?.id).single()

    return data?.id
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

      <AssignmentDetails
        assignment={assignment}
        courseName={courseName}
        studentId={profile?.role === "student" ? getStudentId() : ""}
        submission={submission}
      />
    </div>
  )
}
