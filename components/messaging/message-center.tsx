"use client"

import { useState, useEffect } from "react"
import { Send, Trash, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  is_read: boolean
  created_at: string
  sender: {
    first_name: string
    last_name: string
    role: string
  }
  recipient: {
    first_name: string
    last_name: string
    role: string
  }
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  role: string
}

export function MessageCenter() {
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState("")
  const [newMessageSubject, setNewMessageSubject] = useState("")
  const [newMessageContent, setNewMessageContent] = useState("")
  const [activeTab, setActiveTab] = useState("inbox")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Fetch received messages
        const { data: inboxData, error: inboxError } = await supabase
          .from("messages")
          .select(`
            *,
            sender:sender_id(
              first_name,
              last_name,
              role
            ),
            recipient:recipient_id(
              first_name,
              last_name,
              role
            )
          `)
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })

        if (inboxError) throw inboxError

        // Fetch sent messages
        const { data: sentData, error: sentError } = await supabase
          .from("messages")
          .select(`
            *,
            sender:sender_id(
              first_name,
              last_name,
              role
            ),
            recipient:recipient_id(
              first_name,
              last_name,
              role
            )
          `)
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false })

        if (sentError) throw sentError

        // Combine messages
        setMessages([...(inboxData || []), ...(sentData || [])])

        // Fetch users for composing messages
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, role")
          .neq("id", user.id)

        if (usersError) throw usersError
        setUsers(usersData || [])
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Failed to load messages",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [user, supabase, toast])

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, is_read: true } : message)))
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from("messages").delete().eq("id", messageId)

      if (error) throw error

      // Update local state
      setMessages((prev) => prev.filter((message) => message.id !== messageId))
      setSelectedMessage(null)

      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Failed to delete message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!user || !newMessageRecipient || !newMessageSubject.trim() || !newMessageContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: newMessageRecipient,
          subject: newMessageSubject,
          content: newMessageContent,
          is_read: false,
        })
        .select(`
          *,
          sender:sender_id(
            first_name,
            last_name,
            role
          ),
          recipient:recipient_id(
            first_name,
            last_name,
            role
          )
        `)
        .single()

      if (error) throw error

      // Update local state
      setMessages((prev) => [data, ...prev])

      // Reset form
      setNewMessageRecipient("")
      setNewMessageSubject("")
      setNewMessageContent("")
      setIsComposing(false)

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getInboxMessages = () => {
    return messages.filter((message) => message.recipient_id === user?.id)
  }

  const getSentMessages = () => {
    return messages.filter((message) => message.sender_id === user?.id)
  }

  const getUnreadCount = () => {
    return getInboxMessages().filter((message) => !message.is_read).length
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
        <h2 className="text-2xl font-bold">Messages</h2>
        <Dialog open={isComposing} onOpenChange={setIsComposing}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>Send a message to another user in the system.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Recipient
                </label>
                <Select value={newMessageRecipient} onValueChange={setNewMessageRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  placeholder="Enter message subject"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="content"
                  placeholder="Type your message here"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposing(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessage} disabled={isSending}>
                {isSending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="flex w-full flex-col items-start justify-start rounded-none border-r p-0">
                  <TabsTrigger value="inbox" className="flex w-full justify-between rounded-none border-b px-4 py-3">
                    <span>Inbox</span>
                    {getUnreadCount() > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {getUnreadCount()}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="w-full rounded-none border-b px-4 py-3 text-left">
                    Sent
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <TabsContent value="inbox" className="m-0">
              <CardHeader>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>
                  {getInboxMessages().length} message{getInboxMessages().length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                        Back
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMessage(selectedMessage.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{selectedMessage.subject}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        From: {selectedMessage.sender.first_name} {selectedMessage.sender.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setNewMessageRecipient(selectedMessage.sender_id)
                          setNewMessageSubject(`Re: ${selectedMessage.subject}`)
                          setIsComposing(true)
                        }}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getInboxMessages().length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">Your inbox is empty</div>
                    ) : (
                      getInboxMessages().map((message) => (
                        <div
                          key={message.id}
                          className={`cursor-pointer py-3 ${!message.is_read ? "font-medium" : ""}`}
                          onClick={() => {
                            setSelectedMessage(message)
                            if (!message.is_read) {
                              markAsRead(message.id)
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {!message.is_read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                              <span>{message.subject}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            From: {message.sender.first_name} {message.sender.last_name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="sent" className="m-0">
              <CardHeader>
                <CardTitle>Sent</CardTitle>
                <CardDescription>
                  {getSentMessages().length} message{getSentMessages().length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                        Back
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMessage(selectedMessage.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{selectedMessage.subject}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        To: {selectedMessage.recipient.first_name} {selectedMessage.recipient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getSentMessages().length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">You haven't sent any messages</div>
                    ) : (
                      getSentMessages().map((message) => (
                        <div
                          key={message.id}
                          className="cursor-pointer py-3"
                          onClick={() => setSelectedMessage(message)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{message.subject}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            To: {message.recipient.first_name} {message.recipient.last_name}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </TabsContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
