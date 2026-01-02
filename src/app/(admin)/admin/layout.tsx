import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

import { AppSidebar } from "./_components/app-sidebar"
import { SearchDialog } from "./_components/search-dialog"
import { ThemeSwitcher } from "./_components/theme-switcher"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  const user = {
    name: session.user.name || "Admin",
    email: session.user.email || "",
    avatar: session.user.image || "",
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant="inset" collapsible="icon" user={user} />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 overflow-hidden rounded-t-[inherit] border-b bg-background/80 backdrop-blur-md">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <main className="h-full p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
