"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

export default function CreateAssignmentPage() {
  const params = useParams()
  const courseId = params.id as string
  const [courseName, setCourseName] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [totalPoints, setTotalPoints] = useState("100")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return

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
            description: "You don't have permission to create assignments for this course.",
            variant: "destructive",
          })
          router.push(`/courses/${courseId}`)
        }
      } catch (error) {
        console.error("Error fetching course data:", error)
        toast({
          title: "Failed to load course",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
        router.push("/courses")
      }
    }

    fetchCourseData()
  }, [courseId, user, profile, supabase, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !dueDate || !totalPoints) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          title,
          description: description || null,
          course_id: courseId,
          due_date: new Date(dueDate).toISOString(),
          total_points: Number.parseInt(totalPoints),
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Assignment created",
        description: "The assignment has been created successfully.",
      })

      router.push(`/courses/${courseId}/assignments/${data.id}`)
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Failed to create assignment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-3xl font-bold">Create Assignment</h1>
        <p className="text-muted-foreground">Course: {courseName}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Create a new assignment for students in this course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Assignment Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter assignment description, instructions, etc."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="due-date" className="text-sm font-medium">
                  Due Date
                </label>
                <Input
                  id="due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="total-points" className="text-sm font-medium">
                  Total Points
                </label>
                <Input
                  id="total-points"
                  type="number"
                  min="1"
                  max="1000"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/courses/${courseId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
