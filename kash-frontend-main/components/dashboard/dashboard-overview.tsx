"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { TransacaoResponseDTO, TipoTransacao } from "@/types/index"

interface DashboardData {
  balance: number
  totalIncome: number
  totalExpenses: number
  netWorth: number
  recentTransactions: TransacaoResponseDTO[]
  monthlyData: {
    month: string
    income: number
    expenses: number
  }[]
  categoryData: {
    category: string
    amount: number
  }[]
}

export function DashboardOverview() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [token])

  const loadDashboardData = async () => {
    if (!token) return

    try {
      const [transactionsResponse, investmentsResponse] = await Promise.all([
        apiService.getTransactions(token),
        apiService.getInvestments(token),
      ])

      const transactions = transactionsResponse.data
      const investments = investmentsResponse.data

      // Calculate dashboard metrics
      const totalIncome = transactions
        .filter(t => t.tipo === TipoTransacao.Receita)
        .reduce((sum, t) => sum + t.valor, 0)

      const totalExpenses = transactions
        .filter(t => t.tipo === TipoTransacao.Despesa)
        .reduce((sum, t) => sum + t.valor, 0)

      const balance = totalIncome - totalExpenses

      const investmentValue = investments.reduce((sum, inv) => sum + inv.valorTotal, 0)
      const netWorth = balance + investmentValue

      // Generate monthly data for chart
      const monthlyData = generateMonthlyData(transactions)
      const categoryData = generateCategoryData(transactions)

      setData({
        balance,
        totalIncome,
        totalExpenses,
        netWorth,
        recentTransactions: transactions.slice(0, 5),
        monthlyData,
        categoryData,
      })
    } catch (error) {
      console.error('Falha ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (transactions: TransacaoResponseDTO[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    return months.map(month => {
      const monthTransactions = transactions.filter(t => 
        new Date(t.data).toLocaleString('default', { month: 'short' }) === month
      )
      
      const income = monthTransactions
        .filter(t => t.tipo === TipoTransacao.Receita)
        .reduce((sum, t) => sum + t.valor, 0)
      
      const expenses = monthTransactions
        .filter(t => t.tipo === TipoTransacao.Despesa)
        .reduce((sum, t) => sum + t.valor, 0)

      return {
        month,
        income,
        expenses
      }
    })
  }

  const generateCategoryData = (transactions: TransacaoResponseDTO[]) => {
    const categories = Array.from(new Set(transactions.map(t => t.categoriaNome)))
    
    return categories.map(category => {
      const amount = transactions
        .filter(t => t.categoriaNome === category && t.tipo === TipoTransacao.Despesa)
        .reduce((sum, t) => sum + t.valor, 0)
      
      return {
        category,
        amount
      }
    }).filter(item => item.amount > 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data) return null

  const chartConfig = {
    income: {
      label: "Receitas",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Despesas",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.balance >= 0 ? '+' : ''}{data.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-500" />
              +2.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{data.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{data.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              -3% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.netWorth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpIcon className="inline h-3 w-3 text-green-500" />
              +8.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visão Mensal</CardTitle>
            <CardDescription>
              Receitas vs Despesas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <AreaChart data={data.monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="var(--color-income)"
                  fill="var(--color-income)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="var(--color-expenses)"
                  fill="var(--color-expenses)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos seus gastos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={data.categoryData}>
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-expenses)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Suas últimas atividades financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.tipo === TipoTransacao.Receita ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.tipo === TipoTransacao.Receita ? 
                      <ArrowUpIcon className="h-4 w-4" /> : 
                      <ArrowDownIcon className="h-4 w-4" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{transaction.descricao}</p>
                    <p className="text-sm text-muted-foreground">{transaction.categoriaNome}</p>
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.tipo === TipoTransacao.Receita ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.tipo === TipoTransacao.Receita ? '+' : '-'}{transaction.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}