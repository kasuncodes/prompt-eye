"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { NavGroup, NavItem } from "@/config/navigation"

interface NavMainProps {
  readonly items: readonly NavGroup[]
}

function ComingSoonBadge() {
  return (
    <span className="ml-auto rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
      Soon
    </span>
  )
}

function NavItemExpanded({
  item,
  isActive,
  isSubmenuOpen,
}: {
  item: NavItem
  isActive: (url: string, items?: NavItem["items"]) => boolean
  isSubmenuOpen: (items?: NavItem["items"]) => boolean
}) {
  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={isSubmenuOpen(item.items)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.items ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.items)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <ComingSoonBadge />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
            >
              <Link prefetch={false} href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.comingSoon && <ComingSoonBadge />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.items && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    aria-disabled={subItem.comingSoon}
                    isActive={isActive(subItem.url)}
                    asChild
                  >
                    <Link prefetch={false} href={subItem.url}>
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <ComingSoonBadge />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  )
}

function NavItemCollapsed({
  item,
  isActive,
}: {
  item: NavItem
  isActive: (url: string, items?: NavItem["items"]) => boolean
}) {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.items)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
          {item.items?.map((subItem) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <SidebarMenuSubButton
                key={subItem.title}
                asChild
                className="focus-visible:ring-0"
                aria-disabled={subItem.comingSoon}
                isActive={isActive(subItem.url)}
              >
                <Link prefetch={false} href={subItem.url}>
                  <span>{subItem.title}</span>
                  {subItem.comingSoon && <ComingSoonBadge />}
                </Link>
              </SidebarMenuSubButton>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function NavMain({ items }: NavMainProps) {
  const path = usePathname()
  const { state, isMobile } = useSidebar()

  const isItemActive = (url: string, subItems?: NavItem["items"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url))
    }
    return path === url
  }

  const isSubmenuOpen = (subItems?: NavItem["items"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false
  }

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  if (!item.items) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url)}
                        >
                          <Link prefetch={false} href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                  return (
                    <NavItemCollapsed
                      key={item.title}
                      item={item}
                      isActive={isItemActive}
                    />
                  )
                }
                return (
                  <NavItemExpanded
                    key={item.title}
                    item={item}
                    isActive={isItemActive}
                    isSubmenuOpen={isSubmenuOpen}
                  />
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
