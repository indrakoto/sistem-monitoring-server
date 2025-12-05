'use client'

import dynamic from 'next/dynamic'

// Dynamic import untuk client-side only
const CpuGaugeChart = dynamic(() => import('@/components/CpuGaugeChart'), {
  ssr: false,
  loading: () => <div className="text-gray-500">Loading CPU Gauge...</div>
})

export default function TestCpuPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">CPU Gauge Test</h1>
      
      <div className="max-w-2xl mx-auto">
        <CpuGaugeChart
          usagePercent={45.5}
          currentFrequency={3504}
          maxFrequency={3504}
          physicalCores={12}
          totalCores={12}
        />
      </div>
    </div>
  )
}