import Link from 'next/link'

interface ServerCardProps {
  id: number
  name: string
  cpu_percent: number
  cpu_freq_mhz: number | null
  cpu_cores: number
  cpu_total_cores: number  // ← PROPS INI ADA DI INTERFACE
  ram_percent: number
  ram_used_gb: number
  ram_total_gb: number
  storage_percent: number
  storage_used_gb: number
  storage_total_gb: number
 
  storage_free_gb: number    // ← GANTI storage_used_gb dengan free_gb
  
  os: string
  os_version: string
  architecture: string
  processor: string
  status: 'healthy' | 'warning' | 'critical'
  last_updated: string
}

export default function ServerCard({
  id,
  name,
  cpu_percent,
  cpu_freq_mhz,
  cpu_cores,
  cpu_total_cores,  // ← TERIMA PROP INI
  ram_percent,
  ram_used_gb,
  ram_total_gb,
  storage_percent,
  storage_used_gb,
  storage_total_gb,
  storage_free_gb,
  os,
  os_version,
  architecture,
  processor,
  status,
  last_updated
}: ServerCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'text-red-400'
    if (value >= 75) return 'text-yellow-400'
    return 'text-green-400'
  }

  const formatGB = (gb: number | undefined | null) => {
    if (gb === undefined || gb === null || isNaN(gb)) {
      return '0.0'
    }
    return gb.toFixed(1)
  }

  const safePercent = (percent: number) => {
    if (isNaN(percent) || percent < 0) return 0
    if (percent > 100) return 100
    return percent
  }

  return (
    <Link href={`/dashboard/server/${id}`}>
      <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition duration-200 border border-gray-700 hover:border-gray-600 cursor-pointer h-full">
        {/* Header dengan OS Info */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <div className="text-gray-400 text-sm mt-1">
              {os || 'Unknown'} {os_version} • {architecture} • {processor}
            </div>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
            <span className="text-sm text-gray-300 capitalize">{status}</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* CPU Section */}
          <div>
            <div className="flex justify-between mb-1">
              <div className="text-gray-400">
                ⚡ CPU
              </div>
              <span className={`font-semibold ${getMetricColor(cpu_percent)}`}>
                {safePercent(cpu_percent).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  cpu_percent >= 90 ? 'bg-red-500' : 
                  cpu_percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${safePercent(cpu_percent)}%` }}
              ></div>
            </div>
                <div className="text-gray-500 text-xs mt-1">
                    Physical: {cpu_total_cores || 0} Cores • Frequency: {cpu_freq_mhz ? (cpu_freq_mhz / 1000).toFixed(2) : '0.00'} GHz
                </div>            
          </div>

          {/* RAM Section */}
          <div>
            <div className="flex justify-between mb-1">
              <div className="text-gray-400">
                💾 RAM
              </div>
              <span className={`font-semibold ${getMetricColor(ram_percent)}`}>
                {safePercent(ram_percent).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  ram_percent >= 90 ? 'bg-red-500' : 
                  ram_percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${safePercent(ram_percent)}%` }}
              ></div>
            </div>
                <div className="text-gray-500 text-xs mt-1">
                    {formatGB(ram_used_gb)}/{formatGB(ram_total_gb)} GiB
                </div>
          </div>

          {/* Storage Section */}

            <div>
            <div className="flex justify-between mb-1">
                <div className="text-gray-400">
                💽 DISK
                </div>
                <span className={`font-semibold ${getMetricColor(storage_percent)}`}>
                {safePercent(storage_percent).toFixed(1)}% Used
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                className={`h-2 rounded-full ${
                    storage_percent >= 90 ? 'bg-red-500' : 
                    storage_percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${safePercent(storage_percent)}%` }}
                ></div>
            </div>
                <div className="text-gray-500 text-xs mt-1">
                    {formatGB(storage_used_gb)} GiB used of {formatGB(storage_total_gb)} GiB
                </div>
            </div>

        </div>

        {/* Footer dengan timestamp */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-gray-500 text-sm flex justify-between items-center">
            <span>Updated: {new Date(last_updated).toLocaleTimeString()}</span>
            <span className="text-blue-400 hover:text-blue-300 transition">
              View details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}