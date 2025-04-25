"use client"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Home,
  MessageSquare,
  Users,
  CreditCard,
  ClipboardList,
  Settings,
  School,
  BarChart,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const adminNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/users", icon: Users },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Departments", href: "/departments", icon: School },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Announcements", href: "/announcements", icon: FileText },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

const teacherNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Grades", href: "/grades", icon: GraduationCap },
  { name: "Attendance", href: "/attendance", icon: ClipboardList },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

const studentNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: FileText },
  { name: "Grades", href: "/grades", icon: GraduationCap },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

const parentNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Children", href: "/children", icon: Users },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Grades", href: "/grades", icon: GraduationCap },
  { name: "Attendance", href: "/attendance", icon: ClipboardList },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { profile } = useAuth()
  const pathname = usePathname()

  let navItems = studentNavItems
  if (profile?.role === "admin") {
    navItems = adminNavItems
  } else if (profile?.role === "teacher") {
    navItems = teacherNavItems
  } else if (profile?.role === "parent") {
    navItems = parentNavItems
  }

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
