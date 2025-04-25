"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { File, FileText, Plus, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Module {
  id: string
  title: string
  position: number
}

interface ContentItem {
  id: string
  module_id: string
  title: string
  content_type: "file" | "text" | "link"
  content: string
  file_url?: string
  position: number
}

interface CourseContentProps {
  courseId: string
  isTeacher: boolean
}

export function CourseContent({ courseId, isTeacher }: CourseContentProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [newContentTitle, setNewContentTitle] = useState("")
  const [newContentType, setNewContentType] = useState<"file" | "text" | "link">("text")
  const [newContentText, setNewContentText] = useState("")
  const [newContentLink, setNewContentLink] = useState("")
  const [newContentFile, setNewContentFile] = useState<File | null>(null)
  const [isAddingModule, setIsAddingModule] = useState(false)
  const [isAddingContent, setIsAddingContent] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Fetch course modules and content
  const fetchCourseContent = async () => {
    setIsLoading(true)
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("position", { ascending: true })

      if (modulesError) throw modulesError
      setModules(modulesData || [])

      if (modulesData && modulesData.length > 0) {
        setActiveModule(modulesData[0].id)

        // Fetch content items for all modules
        const { data: contentData, error: contentError } = await supabase
          .from("course_content")
          .select("*")
          .in(
            "module_id",
            modulesData.map((m) => m.id),
          )
          .order("position", { ascending: true })

        if (contentError) throw contentError
        setContentItems(contentData || [])
      }
    } catch (error) {
      console.error("Error fetching course content:", error)
      toast({
        title: "Failed to load course content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new module
  const addModule = async () => {
    if (!newModuleTitle.trim()) {
      toast({
        title: "Module title required",
        description: "Please enter a title for the module",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the highest position
      const maxPosition = modules.length > 0 ? Math.max(...modules.map((m) => m.position)) : 0

      const { data, error } = await supabase
        .from("course_modules")
        .insert({
          course_id: courseId,
          title: newModuleTitle,
          position: maxPosition + 1,
        })
        .select()
        .single()

      if (error) throw error

      setModules([...modules, data])
      setActiveModule(data.id)
      setNewModuleTitle("")
      setIsAddingModule(false)

      toast({
        title: "Module added",
        description: "The module has been added successfully",
      })
    } catch (error) {
      console.error("Error adding module:", error)
      toast({
        title: "Failed to add module",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Add new content to a module
  const addContent = async () => {
    if (!activeModule) return

    if (!newContentTitle.trim()) {
      toast({
        title: "Content title required",
        description: "Please enter a title for the content",
        variant: "destructive",
      })
      return
    }

    try {
      // Get the highest position for this module
      const moduleItems = contentItems.filter((item) => item.module_id === activeModule)
      const maxPosition = moduleItems.length > 0 ? Math.max(...moduleItems.map((item) => item.position)) : 0

      let fileUrl = null

      // Upload file if selected
      if (newContentType === "file" && newContentFile) {
        const fileExt = newContentFile.name.split(".").pop()
        const fileName = `${courseId}/${activeModule}/${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data, error } = await supabase.storage.from("course_content").upload(fileName, newContentFile, {
          cacheControl: "3600",
          upsert: true,
        })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage.from("course_content").getPublicUrl(fileName)

        fileUrl = urlData.publicUrl
      }

      const contentValue =
        newContentType === "text"
          ? newContentText
          : newContentType === "link"
            ? newContentLink
            : newContentFile?.name || ""

      const { data, error } = await supabase
        .from("course_content")
        .insert({
          module_id: activeModule,
          title: newContentTitle,
          content_type: newContentType,
          content: contentValue,
          file_url: fileUrl,
          position: maxPosition + 1,
        })
        .select()
        .single()

      if (error) throw error

      setContentItems([...contentItems, data])
      setNewContentTitle("")
      setNewContentText("")
      setNewContentLink("")
      setNewContentFile(null)
      setIsAddingContent(false)

      toast({
        title: "Content added",
        description: "The content has been added successfully",
      })
    } catch (error) {
      console.error("Error adding content:", error)
      toast({
        title: "Failed to add content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewContentFile(e.target.files[0])
    }
  }

  // Remove selected file
  const removeFile = () => {
    setNewContentFile(null)
  }

  // Render content item based on type
  const renderContentItem = (item: ContentItem) => {
    switch (item.content_type) {
      case "text":
        return (
          <div className="prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>
        )
      case "link":
        return (
          <a
            href={item.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <FileText className="mr-2 h-4 w-4" />
            {item.content}
          </a>
        )
      case "file":
        return (
          <a
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            <File className="mr-2 h-4 w-4" />
            {item.content}
          </a>
        )
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Content</h2>
        {isTeacher && (
          <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
                <DialogDescription>Create a new module to organize your course content.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="module-title" className="text-sm font-medium">
                    Module Title
                  </label>
                  <Input
                    id="module-title"
                    placeholder="Enter module title"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                  Cancel
                </Button>
                <Button onClick={addModule}>Add Module</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-medium">No content available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTeacher
              ? "Start by adding a module to organize your course content."
              : "The instructor has not added any content to this course yet."}
          </p>
        </div>
      ) : (
        <Tabs value={activeModule || modules[0].id} onValueChange={setActiveModule} className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            {modules.map((module) => (
              <TabsTrigger key={module.id} value={module.id} className="min-w-max">
                {module.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {modules.map((module) => (
            <TabsContent key={module.id} value={module.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                {isTeacher && (
                  <Dialog open={isAddingContent} onOpenChange={setIsAddingContent}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Add New Content</DialogTitle>
                        <DialogDescription>Add content to the "{module.title}" module.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="content-title" className="text-sm font-medium">
                            Content Title
                          </label>
                          <Input
                            id="content-title"
                            placeholder="Enter content title"
                            value={newContentTitle}
                            onChange={(e) => setNewContentTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Content Type</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={newContentType === "text"}
                                onChange={() => setNewContentType("text")}
                                className="h-4 w-4"
                              />
                              <span>Text</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={newContentType === "link"}
                                onChange={() => setNewContentType("link")}
                                className="h-4 w-4"
                              />
                              <span>Link</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={newContentType === "file"}
                                onChange={() => setNewContentType("file")}
                                className="h-4 w-4"
                              />
                              <span>File</span>
                            </label>
                          </div>
                        </div>

                        {newContentType === "text" && (
                          <div className="space-y-2">
                            <label htmlFor="content-text" className="text-sm font-medium">
                              Content
                            </label>
                            <Textarea
                              id="content-text"
                              placeholder="Enter content text"
                              value={newContentText}
                              onChange={(e) => setNewContentText(e.target.value)}
                              rows={5}
                            />
                          </div>
                        )}

                        {newContentType === "link" && (
                          <div className="space-y-2">
                            <label htmlFor="content-link" className="text-sm font-medium">
                              Link URL
                            </label>
                            <Input
                              id="content-link"
                              placeholder="https://example.com"
                              value={newContentLink}
                              onChange={(e) => setNewContentLink(e.target.value)}
                            />
                          </div>
                        )}

                        {newContentType === "file" && (
                          <div className="space-y-2">
                            <label htmlFor="content-file" className="text-sm font-medium">
                              File
                            </label>

                            {newContentFile ? (
                              <div className="flex items-center justify-between rounded-md border border-input bg-background p-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{newContentFile.name}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center rounded-md border border-dashed border-input p-4">
                                <label
                                  htmlFor="file-upload"
                                  className="flex cursor-pointer flex-col items-center space-y-2"
                                >
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-sm font-medium">Click to upload a file</span>
                                  <span className="text-xs text-muted-foreground">
                                    PDF, DOCX, or other files up to 10MB
                                  </span>
                                  <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingContent(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addContent}>Add Content</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="space-y-4">
                {contentItems
                  .filter((item) => item.module_id === module.id)
                  .map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>{renderContentItem(item)}</CardContent>
                    </Card>
                  ))}

                {contentItems.filter((item) => item.module_id === module.id).length === 0 && (
                  <div className="rounded-md border p-4 text-center">
                    <p className="text-sm text-muted-foreground">No content in this module yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
