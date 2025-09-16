// src/app/admin/analytics/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  Mountain,
  Backpack
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  summary: {
    tripRevenue: number
    equipmentRevenue: number
    totalRevenue: number
    tripParticipants: number
    equipmentOrders: number
    totalOrders: number
  }
  popularTrips: Array<{
    id: string
    title: string
    participants: number
    quota: number
    utilization: number
    bookingCount: number
  }>
  popularEquipment: Array<{
    id: string
    name: string
    category: string
    totalRentals: number
    rentalCount: number
  }>
  transactionStatus: {
    success: number
    pending: number
    failed: number
  }
  trendData: Array<{
    label: string
    tripRevenue: number
    equipmentRevenue: number
    participants: number
    orders: number
  }>
  customerStats: {
    newCustomers: number
    repeatOrders: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p>Gagal memuat data analytics</p>
          <Button onClick={fetchAnalytics} className="mt-4">Coba Lagi</Button>
        </div>
      </div>
    )
  }

  const pieData = [
    { name: 'Sukses', value: data.transactionStatus.success },
    { name: 'Pending', value: data.transactionStatus.pending },
    { name: 'Gagal', value: data.transactionStatus.failed }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analitik</h1>
          <p className="text-gray-600 mt-1">Dashboard analitik dan pelaporan</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hari</SelectItem>
              <SelectItem value="week">Minggu</SelectItem>
              <SelectItem value="month">Bulan</SelectItem>
              <SelectItem value="year">Tahun</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Sewa Alat</CardTitle>
            <Backpack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.equipmentRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Trip</CardTitle>
            <Mountain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.tripRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +8% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +10% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Sewa Alat</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.equipmentOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +15% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peserta Trip</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.tripParticipants}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +5% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +18% dari periode sebelumnya
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pendapatan & Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'tripRevenue' || name === 'equipmentRevenue' 
                      ? formatCurrency(Number(value))
                      : value,
                    name === 'tripRevenue' ? 'Pendapatan Trip' :
                    name === 'equipmentRevenue' ? 'Pendapatan Alat' :
                    name === 'participants' ? 'Peserta' : 'Pesanan'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="tripRevenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="tripRevenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="equipmentRevenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="equipmentRevenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.popularTrips.slice(0, 3).map((trip, index) => (
                <div key={trip.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{index + 1}. {trip.title}</p>
                      <p className="text-xs text-muted-foreground">{trip.participants}/{trip.quota}</p>
                    </div>
                  </div>
                  <Progress value={trip.utilization} className="h-2" />
                  <p className="text-xs text-right">{trip.utilization}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Alat Paling Laris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.popularEquipment.slice(0, 3).map((equipment, index) => (
                <div key={equipment.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{index + 1}. {equipment.name}</p>
                    <p className="text-xs text-muted-foreground">{equipment.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{equipment.totalRentals}</p>
                    <p className="text-xs text-muted-foreground">kali sewa</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status & Customer */}
        <div className="space-y-6">
          {/* Transaction Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Sukses</span>
                  <span className="font-bold">{data.transactionStatus.success}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="font-bold">{data.transactionStatus.pending}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Gagal</span>
                  <span className="font-bold">{data.transactionStatus.failed}%</span>
                </div>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Customer Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">New Customer</span>
                  <span className="font-bold">{data.customerStats.newCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Repeat Order</span>
                  <span className="font-bold">{data.customerStats.repeatOrders}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
