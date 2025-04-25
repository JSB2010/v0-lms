"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AssignmentSubmissionProps {
  assignmentId: string
  studentId: string
  dueDate: string
  title: string
  description?: string | null
  totalPoints: number
  existingSubmission?: {
    id: string
    submission_text: string | null
    submission_url: string | null
    status: string
    submitted_at: string
  } | null
}

export function AssignmentSubmission({
  assignmentId,
  studentId,
  dueDate,
  title,
  description,
  totalPoints,
  existingSubmission,
}: AssignmentSubmissionProps) {
  const [submissionText, setSubmissionText] = useState(existingSubmission?.submission_text || "")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const isPastDue = new Date(dueDate) < new Date()
  const canSubmit = !isPastDue || existingSubmission

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) {
      toast({
        title: "Cannot submit",
        description: "The due date for this assignment has passed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let fileUrl = existingSubmission?.submission_url || null

      // Upload file if selected
      if (file) {
        setIsUploading(true)

        const fileExt = file.name.split(".").pop()
        const fileName = `${studentId}/${assignmentId}/${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data, error } = await supabase.storage.from("submissions").upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage.from("submissions").getPublicUrl(fileName)

        fileUrl = urlData.publicUrl
        setIsUploading(false)
      }

      // Create or update submission
      if (existingSubmission) {
        const { error } = await supabase
          .from("submissions")
          .update({
            submission_text: submissionText,
            submission_url: fileUrl,
            status: "resubmitted",
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubmission.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("submissions").insert({
          assignment_id: assignmentId,
          student_id: studentId,
          submission_text: submissionText,
          submission_url: fileUrl,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Submission successful",
        description: "Your assignment has been submitted successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error submitting assignment:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit assignment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Due: {new Date(dueDate).toLocaleDateString()} • {totalPoints} points
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {description && <p className="text-sm text-muted-foreground">{description}</p>}

          <div className="space-y-2">
            <label htmlFor="submission-text" className="text-sm font-medium">
              Your Answer
            </label>
            <Textarea
              id="submission-text"
              placeholder="Type your answer here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Attachments
            </label>

            {file ? (
              <div className="flex items-center justify-between rounded-md border border-input bg-background p-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : existingSubmission?.submission_url ? (
              <div className="flex items-center justify-between rounded-md border border-input bg-background p-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Previous attachment</span>
                </div>
                <a
                  href={existingSubmission.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-md border border-dashed border-input p-4">
                <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload a file</span>
                  <span className="text-xs text-muted-foreground">PDF, DOCX, or images up to 10MB</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
            )}
          </div>

          {existingSubmission && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">Previous submission</p>
              <p className="text-muted-foreground">
                Submitted on {new Date(existingSubmission.submitted_at).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading || !canSubmit}>
            {isSubmitting || isUploading
              ? "Submitting..."
              : existingSubmission
                ? "Update Submission"
                : "Submit Assignment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
