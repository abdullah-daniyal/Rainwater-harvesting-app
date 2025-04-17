"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

// Define the structure of our historical data records
interface HistoryRecord {
  timestamp: number
  date: string
  averagePh: number
  averageTurbidity: number
  averageTemperature: number
  maxWaterLevel: number
}

export default function HistoryData() {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [selectedTab, setSelectedTab] = useState("7days")

  // Load history data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("waterSystemHistory")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        setHistoryData(parsedData)
      } catch (error) {
        console.error("Failed to parse history data:", error)
      }
    } else {
      // Generate some mock historical data if none exists
      const mockData = generateMockHistoryData()
      setHistoryData(mockData)
      localStorage.setItem("waterSystemHistory", JSON.stringify(mockData))
    }
  }, [])

  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    switch (selectedTab) {
      case "7days":
        return historyData.filter((record) => now - record.timestamp < 7 * dayInMs)
      case "30days":
        return historyData.filter((record) => now - record.timestamp < 30 * dayInMs)
      case "all":
        return historyData
      default:
        return historyData
    }
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-blue-50">
          <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="all">All History</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredData.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No historical data available for this time period.</div>
      ) : (
        <>
          <Card className="bg-white shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-blue-800 mb-4">pH & Turbidity History</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis yAxisId="left" domain={[0, 14]} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 20]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        border: "none",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="averagePh"
                      name="Avg pH Level"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="averageTurbidity"
                      name="Avg Turbidity (NTU)"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Temperature & Water Level History</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                    <YAxis yAxisId="left" domain={[0, 40]} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        border: "none",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="averageTemperature"
                      name="Avg Temperature (°C)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="maxWaterLevel"
                      name="Max Water Level (%)"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Avg pH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Avg Turbidity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Avg Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Max Water Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.averagePh.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.averageTurbidity.toFixed(1)} NTU
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.averageTemperature.toFixed(1)}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.maxWaterLevel.toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// Helper function to generate mock historical data
function generateMockHistoryData(): HistoryRecord[] {
  const data: HistoryRecord[] = []
  const now = new Date()

  // Generate data for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Create some variation in the data
    const dayOffset = Math.sin(i / 5) * 0.5

    data.push({
      timestamp: date.getTime(),
      date: format(date, "MMM dd, yyyy"),
      averagePh: 7.2 + dayOffset + (Math.random() * 0.4 - 0.2),
      averageTurbidity: 4.5 + dayOffset + (Math.random() * 1 - 0.5),
      averageTemperature: 22 + dayOffset + (Math.random() * 2 - 1),
      maxWaterLevel: 75 + dayOffset * 10 + (Math.random() * 10 - 5),
    })
  }

  return data
}
