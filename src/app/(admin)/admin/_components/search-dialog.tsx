"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const searchItems = [
  { group: "Dashboard", icon: LayoutDashboard, label: "Overview", url: "/admin" },
  { group: "Dashboard", icon: BarChart3, label: "Analytics", url: "/admin/analytics" },
  { group: "Management", icon: Users, label: "Users", url: "/admin/users" },
  { group: "Management", icon: Settings, label: "Settings", url: "/admin/settings" },
]

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const groups = [...new Set(searchItems.map((item) => item.group))]

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden lg:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium lg:inline-flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {searchItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.label}
                      onSelect={() => handleSelect(item.url)}
                    >
                      {item.icon && <item.icon className="mr-2 size-4" />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
