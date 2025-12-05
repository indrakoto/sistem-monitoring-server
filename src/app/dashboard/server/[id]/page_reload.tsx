'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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

  // Fetch server details
  useEffect(() => {
    async function fetchServerDetails() {
      if (!serverId) return

      setLoading(true)
      setError('')

      try {
        // 1. Get server info from database
        const serversResponse = await fetch('/api/servers')
        if (!serversResponse.ok) throw new Error('Failed to fetch server list')
        
        const servers = await serversResponse.json()
        const serverInfo = servers.find((s: any) => s.id.toString() === serverId)
        
        if (!serverInfo) {
          setError('Server not found')
          return
        }

        // 2. Get metrics from Python API
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

        // 3. Combine data
        const serverDetail: ServerDetail = {
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

        setServer(serverDetail)
        setNextUpdate(new Date(Date.now() + 5000)) // 5 seconds from now

      } catch (err) {
        console.error('Error fetching server details:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchServerDetails()

    // Set up polling every 5 seconds
    const interval = setInterval(fetchServerDetails, 5000)
    return () => clearInterval(interval)
  }, [serverId])

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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">CPU Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Usage</span>
                <span className={`text-xl font-bold ${
                  server.cpu_percent >= 90 ? 'text-red-400' :
                  server.cpu_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.cpu_percent.toFixed(1)}%
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Frequency</div>
                  <div className="text-lg font-bold text-white">
                    {(server.cpu_freq_mhz / 1000).toFixed(2)} GHz
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Cores</div>
                  <div className="text-lg font-bold text-white">
                    {server.cpu_cores}P/{server.cpu_total_cores}L
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-gray-400 text-sm mb-1">Usage Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      server.cpu_percent >= 90 ? 'bg-red-500' :
                      server.cpu_percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(server.cpu_percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Memory (RAM)</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Usage</span>
                <span className={`text-xl font-bold ${
                  server.ram_percent >= 90 ? 'text-red-400' :
                  server.ram_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.ram_percent.toFixed(1)}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Used</div>
                  <div className="text-lg font-bold text-white">
                    {server.ram_used_gb.toFixed(1)} GB
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Free</div>
                  <div className="text-lg font-bold text-white">
                    {server.ram_free_gb.toFixed(1)} GB
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-lg font-bold text-white">
                    {server.ram_total_gb.toFixed(1)} GB
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-gray-400 text-sm mb-1">Usage Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      server.ram_percent >= 90 ? 'bg-red-500' :
                      server.ram_percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(server.ram_percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Storage</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Usage</span>
                <span className={`text-xl font-bold ${
                  server.storage_percent >= 90 ? 'text-red-400' :
                  server.storage_percent >= 75 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {server.storage_percent.toFixed(1)}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Used</div>
                  <div className="text-lg font-bold text-white">
                    {server.storage_used_gb.toFixed(1)} GB
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Free</div>
                  <div className="text-lg font-bold text-white">
                    {server.storage_free_gb.toFixed(1)} GB
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-lg font-bold text-white">
                    {server.storage_total_gb.toFixed(1)} GB
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-gray-400 text-sm mb-1">Usage Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      server.storage_percent >= 90 ? 'bg-red-500' :
                      server.storage_percent >= 75 ? 'text-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(server.storage_percent, 100)}%` }}
                  ></div>
                </div>
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