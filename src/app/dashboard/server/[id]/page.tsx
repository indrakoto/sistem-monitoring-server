'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import charts (client-side only)
const CpuGaugeChart = dynamic(() => import('@/components/CpuGaugeChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[500px] flex items-center justify-center">
      <div className="text-gray-500">Loading CPU gauge...</div>
    </div>
  )
})

const MemoryBarChart = dynamic(() => import('@/components/MemoryBarChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[400px] flex items-center justify-center">
      <div className="text-gray-500">Loading memory chart...</div>
    </div>
  )
})

const RamGaugeChart = dynamic(() => import('@/components/RamGaugeChart'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[500px] flex items-center justify-center">
      <div className="text-gray-500">Loading RAM gauge...</div>
    </div>
  )
})

interface ServerDetail {
  id: number
  name: string
  // CPU Data
  cpu_percent: number
  cpu_freq_mhz: number
  cpu_cores: number
  cpu_total_cores: number
  // RAM Data
  ram_percent: number
  ram_used_gb: number
  ram_total_gb: number
  ram_free_gb: number
  // Storage Data
  storage_percent: number
  storage_used_gb: number
  storage_free_gb: number
  storage_total_gb: number
  // System Info
  os: string
  os_version: string
  architecture: string
  processor: string
  // Timestamp
  last_updated: string
  url_api: string
}

export default function ServerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const serverId = params.id as string

  const [server, setServer] = useState<ServerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null)

  // Initial fetch (once)
  useEffect(() => {
    async function fetchInitialData() {
      if (!serverId) return

      setLoading(true)
      
      try {
        // Get server info from database
        const serversResponse = await fetch('/api/servers')
        if (!serversResponse.ok) throw new Error('Failed to fetch server list')
        
        const servers = await serversResponse.json()
        const serverInfo = servers.find((s: any) => s.id.toString() === serverId)
        
        if (!serverInfo) {
          setError('Server not found')
          return
        }

        // Get initial metrics
        const token = localStorage.getItem('auth_token')
        const metricsResponse = await fetch(serverInfo.url_api, {
          headers: {
            'Authorization': token || ''
          }
        })

        if (!metricsResponse.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`)
        }

        const metricsData = await metricsResponse.json()

        // Set initial server data
        const initialServer: ServerDetail = {
          id: serverInfo.id,
          name: serverInfo.name,
          // CPU Data
          cpu_percent: metricsData.hardware.cpu.usage_percent,
          cpu_freq_mhz: metricsData.hardware.cpu.current_frequency_mhz,
          cpu_cores: metricsData.hardware.cpu.physical_cores,
          cpu_total_cores: metricsData.hardware.cpu.total_cores,
          // RAM Data
          ram_percent: metricsData.hardware.ram.usage_percent,
          ram_used_gb: metricsData.hardware.ram.used_gb,
          ram_total_gb: metricsData.hardware.ram.total_gb,
          ram_free_gb: metricsData.hardware.ram.available_gb,
          // Storage Data
          storage_percent: metricsData.hardware.storage.usage_percent,
          storage_used_gb: metricsData.hardware.storage.used_gb,
          storage_free_gb: metricsData.hardware.storage.free_gb,
          storage_total_gb: metricsData.hardware.storage.total_gb,
          // System Info
          os: metricsData.system.os,
          os_version: metricsData.system.os_version,
          architecture: metricsData.system.architecture,
          processor: metricsData.system.processor,
          // Timestamp & URL
          last_updated: metricsData.timestamp,
          url_api: serverInfo.url_api
        }

        setServer(initialServer)
        setNextUpdate(new Date(Date.now() + 5000))

      } catch (err) {
        console.error('Error fetching server details:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [serverId])

  // Polling for metrics updates
  useEffect(() => {
    if (!server) return

    async function fetchMetrics() {
      try {
        const token = localStorage.getItem('auth_token')

        if (!server) {
          // Bisa return loading, atau cukup hindari fetch
          return null; // atau <div>Loading...</div>
        }

        const metricsResponse = await fetch(server.url_api, {
          headers: {
            'Authorization': token || ''
          }
        })

        if (!metricsResponse.ok) return

        const metricsData = await metricsResponse.json()

        // Update only metrics data
        setServer(prev => prev ? {
          ...prev,
          cpu_percent: metricsData.hardware.cpu.usage_percent,
          cpu_freq_mhz: metricsData.hardware.cpu.current_frequency_mhz,
          ram_percent: metricsData.hardware.ram.usage_percent,
          ram_used_gb: metricsData.hardware.ram.used_gb,
          ram_free_gb: metricsData.hardware.ram.available_gb,
          storage_percent: metricsData.hardware.storage.usage_percent,
          storage_used_gb: metricsData.hardware.storage.used_gb,
          storage_free_gb: metricsData.hardware.storage.free_gb,
          last_updated: metricsData.timestamp
        } : null)

        setNextUpdate(new Date(Date.now() + 5000))

      } catch (err) {
        console.error('Error polling metrics:', err)
      }
    }

    fetchMetrics()
    
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [server])

  // Update next update time every second
  useEffect(() => {
    if (!nextUpdate) return

    const timer = setInterval(() => {
      setNextUpdate(new Date(Date.now() + 5000))
    }, 1000)

    return () => clearInterval(timer)
  }, [nextUpdate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center py-12">
            Loading server details...
          </div>
        </div>
      </div>
    )
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || 'Server not found'}</p>
            <Link 
              href="/dashboard"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-gray-400 hover:text-white mb-4 md:mb-0"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white mt-2">
                🖥️ {server.name}
              </h1>
              <div className="text-gray-400 mt-1">
                {server.os} {server.os_version} • {server.architecture} • {server.processor}
              </div>
            </div>
            
            <div className="text-gray-500 text-sm">
              <div>Last Updated: {new Date(server.last_updated).toLocaleTimeString()}</div>
              {nextUpdate && (
                <div className="mt-1">
                  Next Update: {nextUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* CPU Gauge - Kiri */}
  <div className="lg:col-span-1">
    <CpuGaugeChart
      usagePercent={server.cpu_percent}
      currentFrequency={server.cpu_freq_mhz}
      maxFrequency={server.cpu_freq_mhz}
      physicalCores={server.cpu_cores}
      totalCores={server.cpu_total_cores}
    />
  </div>

  {/* RAM Gauge - Kanan */}
  <div className="lg:col-span-1">
    <RamGaugeChart
      usedGB={server.ram_used_gb}
      totalGB={server.ram_total_gb}
    />
  </div>
</div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* CPU Details Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">CPU Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Physical Cores</span>
                <span className="text-white">{server.cpu_cores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Logical Cores</span>
                <span className="text-white">{server.cpu_total_cores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Frequency</span>
                <span className="text-white">{(server.cpu_freq_mhz / 1000).toFixed(2)} GHz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold ${
                  server.cpu_percent >= 90 ? 'text-red-400' :
                  server.cpu_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.cpu_percent >= 90 ? 'Critical' :
                   server.cpu_percent >= 75 ? 'Warning' : 'Healthy'}
                </span>
              </div>
            </div>
          </div>

          {/* RAM Details Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Memory Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Used</span>
                <span className="text-white">{server.ram_used_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free</span>
                <span className="text-white">{server.ram_free_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{server.ram_total_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold ${
                  server.ram_percent >= 90 ? 'text-red-400' :
                  server.ram_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.ram_percent >= 90 ? 'Critical' :
                   server.ram_percent >= 75 ? 'Warning' : 'Healthy'}
                </span>
              </div>
            </div>
          </div>

          {/* Storage Details Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Storage Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Used</span>
                <span className="text-white">{server.storage_used_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Free</span>
                <span className="text-white">{server.storage_free_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{server.storage_total_gb.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-semibold ${
                  server.storage_percent >= 90 ? 'text-red-400' :
                  server.storage_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.storage_percent >= 90 ? 'Critical' :
                   server.storage_percent >= 75 ? 'Warning' : 'Healthy'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>📊 Auto-refreshes every 5 seconds</p>
          <p className="mt-1">API Endpoint: <code className="bg-gray-800 px-2 py-1 rounded">{server.url_api}</code></p>
        </div>
      </div>
    </div>
  )
}