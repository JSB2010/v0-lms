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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

export default function EditCoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [period, setPeriod] = useState("")
  const [schoolYear, setSchoolYear] = useState("")
  const [semester, setSemester] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [availableTeachers, setAvailableTeachers] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select(`
            *,
            teacher:teacher_id(
              profile:profile_id(
                first_name,
                last_name
              )
            )
          `)
          .eq("id", courseId)
          .single()

        if (courseError) throw courseError

        // Check if user is the teacher of this course or an admin
        if (profile?.role !== "admin" && (profile?.role !== "teacher" || courseData.teacher_id !== user.id)) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this course.",
            variant: "destructive",
          })
          router.push(`/courses/${courseId}`)
          return
        }

        // Set form values
        setName(courseData.name)
        setDescription(courseData.description || "")
        setPeriod(courseData.period || "")
        setSchoolYear(courseData.school_year)
        setSemester(courseData.semester)
        setTeacherId(courseData.teacher_id)

        // If admin, fetch available teachers
        if (profile?.role === "admin") {
          const { data: teachersData, error: teachersError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("role", "teacher")
            .order("last_name", { ascending: true })

          if (teachersError) throw teachersError

          setAvailableTeachers(
            teachersData.map((teacher) => ({
              id: teacher.id,
              name: `${teacher.first_name} ${teacher.last_name}`,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching course data:", error)
        toast({
          title: "Failed to load course",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
        router.push(`/courses/${courseId}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, user, profile, supabase, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !schoolYear || !semester) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: any = {
        name,
        description: description || null,
        period: period || null,
        school_year: schoolYear,
        semester,
      }

      // Only admin can change teacher
      if (profile?.role === "admin") {
        updateData.teacher_id = teacherId
      }

      const { error } = await supabase.from("courses").update(updateData).eq("id", courseId)

      if (error) throw error

      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      })

      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Failed to update course",
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
        <h1 className="text-3xl font-bold">Edit Course</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Update the information for this course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Course Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter course name"
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
                placeholder="Enter course description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="period" className="text-sm font-medium">
                  Period (Optional)
                </label>
                <Input
                  id="period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g., 1st, 2nd, etc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="school-year" className="text-sm font-medium">
                  School Year
                </label>
                <Input
                  id="school-year"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  placeholder="e.g., 2023-2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="semester" className="text-sm font-medium">
                  Semester
                </label>
                <Select value={semester} onValueChange={setSemester} required>
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

            {profile?.role === "admin" && (
              <div className="space-y-2">
                <label htmlFor="teacher" className="text-sm font-medium">
                  Teacher
                </label>
                <Select value={teacherId} onValueChange={setTeacherId} required>
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
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href={`/courses/${courseId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
