"use client"

import { useState } from "react"
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { TransactionsPage } from "@/components/transactions/transactions-page"
import { InvestmentsPage } from "@/components/investments/investments-page"
import { ProjectionsPage } from "@/components/projections/projections-page"
import { NewsPage } from "@/components/news/news-page"
import { ProfilePage } from "@/components/profile/profile-page"

export type ActivePage = 'dashboard' | 'transactions' | 'investments' | 'projections' | 'news' | 'profile'

export function Dashboard() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview />
      case 'transactions':
        return <TransactionsPage />
      case 'investments':
        return <InvestmentsPage />
      case 'projections':
        return <ProjectionsPage />
      case 'news':
        return <NewsPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activePage={activePage} setActivePage={setActivePage} />
        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold capitalize">{activePage}</h1>
            </div>
          </header>
          <main className="flex-1 p-6">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
