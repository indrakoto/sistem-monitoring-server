'use client'

import { ResponsiveBar } from '@nivo/bar'

interface MemoryBarChartProps {
  used: number  // dalam GB
  total: number // dalam GB
  type?: 'RAM' | 'Storage'
}

export default function MemoryBarChart({ 
  used, 
  total, 
  type = 'RAM' 
}: MemoryBarChartProps) {
  
  const free = total - used
  const usagePercent = total > 0 ? (used / total) * 100 : 0
  
  // Data untuk Nivo bar chart
  const data = [
    {
      resource: type,
      used: parseFloat(used.toFixed(2)),
      free: parseFloat(free.toFixed(2)),
    }
  ]

  // Determine colors based on usage
  const getColors = () => {
    if (usagePercent >= 90) return ['#FF4560', '#374151'] // Red for high usage
    if (usagePercent >= 75) return ['#FEB019', '#374151'] // Yellow for warning
    return ['#00E396', '#374151'] // Green for normal
  }

  const [usedColor, freeColor] = getColors()

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[400px]">
      <h3 className="text-xl font-bold text-white mb-6">
        {type} Usage: {usagePercent.toFixed(1)}%
      </h3>
      
      <div className="h-[300px]">
        <ResponsiveBar
          data={data}
          keys={['used', 'free']}
          indexBy="resource"
          margin={{ top: 10, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          layout="horizontal"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={({ id }) => id === 'used' ? usedColor : freeColor}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'GB',
            legendPosition: 'middle',
            legendOffset: 32,
            format: (value) => `${value} GB`
          }}
          axisLeft={null}
          enableGridY={false}
          label={(d) => `${d.value} GB`}
          labelTextColor="#ffffff"
          labelSkipWidth={12}
          labelSkipHeight={12}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel={`${type} usage chart`}
          barAriaLabel={(e) => `${e.id}: ${e.formattedValue} GB`}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Used</div>
          <div className="text-xl font-bold text-white">{used.toFixed(1)} GB</div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Free</div>
          <div className="text-xl font-bold text-white">{free.toFixed(1)} GB</div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="text-gray-400 text-sm">Total</div>
          <div className="text-xl font-bold text-white">{total.toFixed(1)} GB</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center justify-end">
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
  )
}