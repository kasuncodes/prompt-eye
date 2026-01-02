import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  FileText,
  ShieldCheck,
  Cpu,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  comingSoon?: boolean
  items?: NavSubItem[]
}

export interface NavSubItem {
  title: string
  url: string
  comingSoon?: boolean
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const sidebarItems: NavGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
        comingSoon: true,
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
      {
        title: "LLM Engines",
        url: "/admin/llm-engines",
        icon: Cpu,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Admin Users",
        url: "/admin/admin-users",
        icon: ShieldCheck,
      },
    ],
  },
]
