'use client'

import { useState, useEffect } from 'react'
import ServerCard from '@/components/ServerCard'

interface Server {
  id: number
  name: string
  url_api: string
}

interface ServerMetrics {
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
  // Storage Data
  storage_percent: number
  storage_used_gb: number
  storage_total_gb: number
  storage_free_gb: number
  // System Info
  os: string
  os_version: string
  architecture: string
  processor: string
  // Status
  status: 'healthy' | 'warning' | 'critical'
  last_updated: string
}

export default function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([])
  const [metrics, setMetrics] = useState<ServerMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch server list
  useEffect(() => {
    async function fetchServers() {
      try {
        const response = await fetch('/api/servers')
        if (response.ok) {
          const data = await response.json()
          setServers(data)
        }
      } catch (err) {
        console.error('Error fetching servers:', err)
      }
    }
    
    fetchServers()
  }, [])

  // Fetch metrics for each server
  useEffect(() => {
    if (servers.length === 0) return

    const fetchMetrics = async () => {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('auth_token')

        const metricsPromises = servers.map(async (server) => {
          try {
            const response = await fetch(server.url_api, {
              headers: {
                'Authorization': token || ''
              }
            })

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            
            return {
              id: server.id,
              name: server.name,
              // CPU Data
              cpu_percent: data.hardware.cpu.usage_percent,
              cpu_freq_mhz: data.hardware.cpu.current_frequency_mhz,
              cpu_cores: data.hardware.cpu.physical_cores,
              cpu_total_cores: data.hardware.cpu.total_cores,
              // RAM Data
              ram_percent: data.hardware.ram.usage_percent,
              ram_used_gb: data.hardware.ram.used_gb,
              ram_total_gb: data.hardware.ram.total_gb,
              // Storage Data
              storage_percent: data.hardware.storage.usage_percent,
              storage_used_gb: data.hardware.storage.used_gb,
              storage_total_gb: data.hardware.storage.total_gb,
              storage_free_gb: data.hardware.storage.free_gb,    // ← FREE bukan USED
            
              // System Info
              os: data.system.os,
              os_version: data.system.os_version,
              architecture: data.system.architecture,
              processor: data.system.processor,
              // Status & timestamp
              status: data.hardware.cpu.usage_percent > 90 || 
                      data.hardware.ram.usage_percent > 90 || 
                      data.hardware.storage.usage_percent > 90 ? 'critical' :
                      data.hardware.cpu.usage_percent > 75 || 
                      data.hardware.ram.usage_percent > 75 || 
                      data.hardware.storage.usage_percent > 75 ? 'warning' : 'healthy',
              last_updated: data.timestamp,
              raw_data: data
            }
          } catch (err) {
            console.error(`Error fetching ${server.name}:`, err)
            return {
              id: server.id,
              name: server.name,
              // CPU Data (default values)
              cpu_percent: 0,
              cpu_freq_mhz: 0,
              cpu_cores: 0,
              cpu_total_cores: 0,
              // RAM Data (default values)
              ram_percent: 0,
              ram_used_gb: 0,
              ram_total_gb: 0,
              // Storage Data (default values)
              storage_percent: 0,
              storage_used_gb: 0,
              storage_total_gb: 0,
              storage_free_gb: 0,
              // System Info (default values)
              os: 'Unknown',
              os_version: 'Unknown',
              architecture: 'Unknown',
              processor: 'Unknown',
              // Status & timestamp
              status: 'critical' as const,
              last_updated: new Date().toISOString(),
              error: 'Failed to fetch'
            }
          }
        })

        const results = await Promise.all(metricsPromises)
        setMetrics(results)
      } catch (err) {
        setError('Failed to fetch server metrics')
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    
    // Set up polling every 10 seconds
    //const interval = setInterval(fetchMetrics, 10000)
    // Set up polling every 2 seconds
    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [servers])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Dashboard</h1>
        <p className="text-gray-400">Real-time monitoring of your servers</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {loading && servers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading servers...</div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Servers</h3>
              <p className="text-3xl font-bold text-white">{servers.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Healthy</h3>
              <p className="text-3xl font-bold text-green-500">
                {metrics.filter(m => m.status === 'healthy').length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Last Updated</h3>
              <p className="text-lg text-white">
                {metrics.length > 0 
                  ? new Date(metrics[0].last_updated).toLocaleTimeString()
                  : 'Never'
                }
              </p>
            </div>
          </div>

          {/* Server Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {metrics.map((server) => (
              <ServerCard
                key={server.id}
                id={server.id}
                name={server.name}
                cpu_percent={server.cpu_percent}
                cpu_freq_mhz={server.cpu_freq_mhz}
                cpu_cores={server.cpu_cores}
                cpu_total_cores={server.cpu_total_cores}
                ram_percent={server.ram_percent}
                ram_used_gb={server.ram_used_gb}
                ram_total_gb={server.ram_total_gb}
                storage_percent={server.storage_percent}
                storage_used_gb={server.storage_used_gb}
                storage_total_gb={server.storage_total_gb}
                storage_free_gb={server.storage_free_gb} 
                os={server.os}
                os_version={server.os_version}
                architecture={server.architecture}
                processor={server.processor}
                status={server.status}
                last_updated={server.last_updated}
              />
            ))}
          </div>

          {metrics.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <div className="text-gray-400">No server metrics available</div>
              <div className="text-gray-500 text-sm mt-2">
                Make sure your Python APIs are running
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-gray-500 text-sm">
        <p>📊 Auto-refreshes every 10 seconds</p>
        <p className="mt-1">Click on any server card to view detailed metrics</p>
      </div>
    </div>
  )
}