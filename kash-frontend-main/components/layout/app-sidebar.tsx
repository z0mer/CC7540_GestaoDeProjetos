"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, ArrowUpDown, TrendingUp, BarChart3, Newspaper, User, LogOut, ChevronUp } from 'lucide-react'
import { ActivePage } from "@/components/dashboard/dashboard"

interface AppSidebarProps {
  activePage: ActivePage
  setActivePage: (page: ActivePage) => void
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    key: "dashboard" as ActivePage,
  },
  {
    title: "Transactions",
    icon: ArrowUpDown,
    key: "transactions" as ActivePage,
  },
  {
    title: "Investments",
    icon: TrendingUp,
    key: "investments" as ActivePage,
  },
  {
    title: "Projections",
    icon: BarChart3,
    key: "projections" as ActivePage,
  },
  {
    title: "News",
    icon: Newspaper,
    key: "news" as ActivePage,
  },
]

export function AppSidebar({ activePage, setActivePage }: AppSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            K
          </div>
          <span className="text-lg font-bold">KASH</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activePage === item.key}
                    onClick={() => setActivePage(item.key)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2">
          <ThemeToggle />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={() => setActivePage('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
