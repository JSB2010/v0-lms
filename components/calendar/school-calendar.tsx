"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  event_type: "assignment" | "exam" | "school" | "personal"
  course_id: string | null
  created_by: string
}

interface Course {
  id: string
  name: string
}

export function SchoolCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">("month")
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    event_type: "personal" as "assignment" | "exam" | "school" | "personal",
    course_id: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch user's courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("id, name")
          .order("name")

        if (coursesError) throw coursesError
        setCourses(coursesData || [])

        // Fetch calendar events
        const { data: eventsData, error: eventsError } = await supabase
          .from("calendar_events")
          .select("*")
          .or(`created_by.eq.${user.id},event_type.eq.school`)
          .order("start_date")

        if (eventsError) throw eventsError
        setEvents(eventsData || [])
      } catch (error) {
        console.error("Error fetching calendar data:", error)
        toast({
          title: "Failed to load calendar",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendarData()
  }, [user, supabase, toast])

  const addEvent = async () => {
    if (!user) return

    if (!newEvent.title.trim() || !newEvent.start_date) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and start date",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          title: newEvent.title,
          description: newEvent.description || null,
          start_date: newEvent.start_date,
          end_date: newEvent.end_date || null,
          event_type: newEvent.event_type,
          course_id: newEvent.course_id || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setEvents([...events, data])
      setNewEvent({
        title: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        event_type: "personal",
        course_id: "",
      })
      setIsAddingEvent(false)

      toast({
        title: "Event added",
        description: "The event has been added to your calendar.",
      })
    } catch (error) {
      console.error("Error adding event:", error)
      toast({
        title: "Failed to add event",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const getEventsForDay = (day: number | null) => {
    if (day === null) return []

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split("T")[0]

    return events.filter((event) => {
      const eventStart = event.start_date.split("T")[0]
      const eventEnd = event.end_date ? event.end_date.split("T")[0] : eventStart

      return dateString >= eventStart && dateString <= eventEnd
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "assignment":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "exam":
        return "bg-red-100 text-red-800 border-red-300"
      case "school":
        return "bg-green-100 text-green-800 border-green-300"
      case "personal":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const navigateToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const navigateToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const navigateToToday = () => {
    setCurrentDate(new Date())
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>Create a new event on your calendar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="event-title" className="text-sm font-medium">
                  Event Title
                </label>
                <Input
                  id="event-title"
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="event-description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Textarea
                  id="event-description"
                  placeholder="Enter event description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="end-date" className="text-sm font-medium">
                    End Date (Optional)
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="event-type" className="text-sm font-medium">
                  Event Type
                </label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) =>
                    setNewEvent({
                      ...newEvent,
                      event_type: value as "assignment" | "exam" | "school" | "personal",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="school">School Event</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newEvent.event_type === "assignment" || newEvent.event_type === "exam") && (
                <div className="space-y-2">
                  <label htmlFor="course" className="text-sm font-medium">
                    Course
                  </label>
                  <Select
                    value={newEvent.course_id}
                    onValueChange={(value) => setNewEvent({ ...newEvent, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                Cancel
              </Button>
              <Button onClick={addEvent}>Add Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={navigateToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>View and manage your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center font-medium">
                {day}
              </div>
            ))}

            {getMonthData().map((day, index) => {
              const dayEvents = getEventsForDay(day)
              const isToday =
                day !== null &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear() &&
                day === new Date().getDate()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] rounded-md border p-1 ${
                    day === null ? "bg-muted/20" : isToday ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  {day !== null && (
                    <>
                      <div className={`text-right text-sm ${isToday ? "font-bold text-primary" : ""}`}>{day}</div>
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.event_type)}`}
                            title={event.description || event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
