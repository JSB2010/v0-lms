"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, Clock, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AssignmentSubmission } from "@/components/assignments/assignment-submission"

interface AssignmentDetailsProps {
  assignment: {
    id: string
    title: string
    description: string | null
    due_date: string
    total_points: number
    course_id: string
    created_at: string
  }
  courseName: string
  studentId: string
  submission?: {
    id: string
    submission_text: string | null
    submission_url: string | null
    status: string
    submitted_at: string
    points_earned: number | null
    feedback: string | null
    graded_at: string | null
  } | null
}

export function AssignmentDetails({ assignment, courseName, studentId, submission }: AssignmentDetailsProps) {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

  const dueDate = new Date(assignment.due_date)
  const isPastDue = dueDate < new Date()
  const isSubmitted = submission !== null && submission !== undefined
  const isGraded = submission?.graded_at !== null

  const getStatusBadge = () => {
    if (isGraded) {
      return <Badge className="bg-green-500">Graded</Badge>
    }
    if (isSubmitted) {
      return <Badge className="bg-blue-500">Submitted</Badge>
    }
    if (isPastDue) {
      return <Badge variant="destructive">Past Due</Badge>
    }
    return <Badge variant="outline">Not Submitted</Badge>
  }

  return (
    <div className="space-y-6">
      {!showSubmissionForm ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <CardDescription>{courseName}</CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Due: {dueDate.toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                {assignment.total_points} points
              </div>
            </div>

            {assignment.description && (
              <div className="prose max-w-none dark:prose-invert">
                <h3>Instructions</h3>
                <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
              </div>
            )}

            {isSubmitted && (
              <div className="rounded-md bg-muted p-4 space-y-3">
                <h3 className="font-medium">Your Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Submitted on {new Date(submission.submitted_at).toLocaleString()}
                </p>

                {submission.submission_text && (
                  <div className="rounded-md bg-card p-3 text-sm border">{submission.submission_text}</div>
                )}

                {submission.submission_url && (
                  <div>
                    <a
                      href={submission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      <FileText className="mr-1 h-4 w-4" />
                      View attachment
                    </a>
                  </div>
                )}

                {isGraded && (
                  <div className="space-y-2 border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Grade:</span>
                      <span>
                        {submission.points_earned} / {assignment.total_points} points
                      </span>
                    </div>

                    {submission.feedback && (
                      <div>
                        <h4 className="font-medium text-sm">Feedback:</h4>
                        <p className="text-sm mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/student/courses/${assignment.course_id}`}>Back to Course</Link>
            </Button>

            {(!isSubmitted || !isGraded) && (
              <Button onClick={() => setShowSubmissionForm(true)}>
                {isSubmitted ? "Edit Submission" : "Submit Assignment"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <AssignmentSubmission
          assignmentId={assignment.id}
          studentId={studentId}
          dueDate={assignment.due_date}
          title={assignment.title}
          description={assignment.description}
          totalPoints={assignment.total_points}
          existingSubmission={submission}
        />
      )}
    </div>
  )
}
