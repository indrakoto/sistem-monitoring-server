'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ApexCharts (client-side only)
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false, // Disable server-side rendering
  loading: () => <div className="h-[350px] flex items-center justify-center text-gray-500">Loading chart...</div>
})

import { ApexOptions } from 'apexcharts'

interface CpuGaugeChartProps {
  usagePercent: number
  currentFrequency: number
  maxFrequency: number
  physicalCores: number
  totalCores: number
}

export default function CpuGaugeChart({
  usagePercent,
  currentFrequency,
  maxFrequency,
  physicalCores,
  totalCores
}: CpuGaugeChartProps) {
  
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Determine color based on usage
  const getColor = (percent: number) => {
    if (percent >= 85) return '#FF4560' // Red
    if (percent >= 75) return '#FEB019' // Yellow
    return '#00E396' // Green
  }

  // Chart options
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 350,
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#9CA3AF',
            offsetY: 120
          },
          value: {
            offsetY: 76,
            fontSize: '32px',
            color: '#FFFFFF',
            formatter: function (val: number) {
              return val.toFixed(1) + '%'
            }
          }
        },
        hollow: {
          margin: 15,
          size: '70%',
        },
        track: {
          background: '#374151',
          strokeWidth: '100%',
          margin: 5,
        },
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [getColor(usagePercent)],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['CPU Usage'],
    colors: [getColor(usagePercent)],
  }

  // Chart data
  const series = [usagePercent]

  if (!isClient) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[500px] flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-bold text-white mb-2">CPU Usage</h3>
        
        {/* Gauge Chart */}
        <div className="w-full max-w-md">
          <ReactApexChart 
            options={options} 
            series={series} 
            type="radialBar" 
            height={350}
          />
        </div>

        {/* CPU Details */}
        <div className="grid grid-cols-2 gap-6 mt-6 w-full max-w-md">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Frequency</div>
            <div className="text-xl font-bold text-white">
              {(currentFrequency / 1000).toFixed(2)} GHz
            </div>
            <div className="text-gray-500 text-xs mt-1">
              Max: {(maxFrequency / 1000).toFixed(2)} GHz
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Cores</div>
            <div className="text-xl font-bold text-white">
              {physicalCores} Physical
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {totalCores} Total Cores
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              usagePercent >= 90 ? 'bg-red-500' :
              usagePercent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
          ></div>
          <span className="text-gray-300">
            {usagePercent >= 90 ? 'Critical' :
             usagePercent >= 75 ? 'Warning' : 'Healthy'}
          </span>
        </div>
      </div>
    </div>
  )
}