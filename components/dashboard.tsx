"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Droplet, Gauge, Activity, Thermometer, ToggleLeft, AlertTriangle } from "lucide-react"
import SensorGauge from "@/components/sensor-gauge"
import ValveControls from "@/components/valve-controls"
import WaterQualityChart from "@/components/water-quality-chart"
import HistoryData from "@/components/history-data"
import { format } from "date-fns"

// Mock data - in a real app, this would come from your ESP32 via an API
const mockSensorData = {
  ph: 7.2,
  turbidity: 4.3, // NTU (Nephelometric Turbidity Units)
  waterLevel: 78, // percentage
  temperature: 22.4, // Celsius
  systemState: "operational", // operational, warning, error
  systemOn: true, // System on/off state
  valves: {
    intake: true,
    solenoidA: true,
    solenoidB: false,
  },
}

// Interface for daily data collection
interface DailyData {
  phValues: number[]
  turbidityValues: number[]
  temperatureValues: number[]
  waterLevelValues: number[]
  date: Date
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(mockSensorData)
  const [isAutoMode, setIsAutoMode] = useState(true)

  // Ref to store daily data collection
  const dailyDataRef = useRef<DailyData>({
    phValues: [],
    turbidityValues: [],
    temperatureValues: [],
    waterLevelValues: [],
    date: new Date(),
  })

  // Check if we need to save daily data and reset collection
  const checkAndSaveDailyData = () => {
    const now = new Date()
    const dailyData = dailyDataRef.current

    // If the day has changed, save the data and reset collection
    if (
      now.getDate() !== dailyData.date.getDate() ||
      now.getMonth() !== dailyData.date.getMonth() ||
      now.getFullYear() !== dailyData.date.getFullYear()
    ) {
      // Only save if we have collected some data
      if (dailyData.phValues.length > 0) {
        // Calculate averages
        const averagePh = dailyData.phValues.reduce((sum, val) => sum + val, 0) / dailyData.phValues.length
        const averageTurbidity =
          dailyData.turbidityValues.reduce((sum, val) => sum + val, 0) / dailyData.turbidityValues.length
        const averageTemperature =
          dailyData.temperatureValues.reduce((sum, val) => sum + val, 0) / dailyData.temperatureValues.length
        const maxWaterLevel = Math.max(...dailyData.waterLevelValues)

        // Create history record
        const historyRecord = {
          timestamp: dailyData.date.getTime(),
          date: format(dailyData.date, "MMM dd, yyyy"),
          averagePh,
          averageTurbidity,
          averageTemperature,
          maxWaterLevel,
        }

        // Save to localStorage
        try {
          const existingData = localStorage.getItem("waterSystemHistory")
          const historyData = existingData ? JSON.parse(existingData) : []
          historyData.push(historyRecord)
          localStorage.setItem("waterSystemHistory", JSON.stringify(historyData))
          console.log("Saved daily data to history:", historyRecord)
        } catch (error) {
          console.error("Failed to save history data:", error)
        }
      }

      // Reset data collection for the new day
      dailyDataRef.current = {
        phValues: [],
        turbidityValues: [],
        temperatureValues: [],
        waterLevelValues: [],
        date: now,
      }
    }
  }

  // Simulate real-time data updates and collect data for daily history
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sensor data with some random variation
      setSensorData((prev) => {
        const newData = {
          ...prev,
          ph: Number.parseFloat((prev.ph + (Math.random() * 0.2 - 0.1)).toFixed(1)),
          turbidity: Number.parseFloat((prev.turbidity + (Math.random() * 0.4 - 0.2)).toFixed(1)),
          waterLevel: Math.min(100, Math.max(0, prev.waterLevel + (Math.random() * 2 - 1))),
          temperature: Number.parseFloat((prev.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1)),
        }

        // Collect data for daily history
        if (prev.systemOn) {
          dailyDataRef.current.phValues.push(newData.ph)
          dailyDataRef.current.turbidityValues.push(newData.turbidity)
          dailyDataRef.current.temperatureValues.push(newData.temperature)
          dailyDataRef.current.waterLevelValues.push(newData.waterLevel)
        }

        return newData
      })

      // Check if we need to save daily data
      checkAndSaveDailyData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleValveToggle = (valve, state) => {
    if (!isAutoMode) {
      setSensorData((prev) => ({
        ...prev,
        valves: {
          ...prev.valves,
          [valve]: state,
        },
      }))
    }
  }

  // Add a function to toggle the system on/off
  const toggleSystem = (state) => {
    setSensorData((prev) => ({
      ...prev,
      systemOn: state,
    }))
  }

  const getSystemState = () => {
    if (sensorData.ph < 6.0 || sensorData.ph > 8.5 || sensorData.turbidity > 10) {
      return "error"
    } else if (sensorData.ph < 6.5 || sensorData.ph > 8.0 || sensorData.turbidity > 5) {
      return "warning"
    }
    return "operational"
  }

  const systemState = getSystemState()

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Rain Water Harvesting System</h1>
            <p className="text-blue-600">Real-time monitoring and control dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
            <Label
              htmlFor="system-power"
              className={`font-medium ${sensorData.systemOn ? "text-green-600" : "text-red-500"}`}
            >
              System {sensorData.systemOn ? "ON" : "OFF"}
            </Label>
            <Switch
              id="system-power"
              checked={sensorData.systemOn}
              onCheckedChange={toggleSystem}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              pH Level
            </CardTitle>
            <CardDescription>Water acidity measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge
              value={sensorData.ph}
              min={0}
              max={14}
              idealMin={6.5}
              idealMax={8.0}
              unit="pH"
              colorScheme="blue"
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              Turbidity
            </CardTitle>
            <CardDescription>Water clarity measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <SensorGauge
              value={sensorData.turbidity}
              min={0}
              max={20}
              idealMin={0}
              idealMax={5}
              unit="NTU"
              colorScheme="blue"
              inverted
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Water Level
            </CardTitle>
            <CardDescription>Current tank capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-full h-32 bg-blue-50 rounded-lg relative overflow-hidden border border-blue-200">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-1000 ease-in-out"
                  style={{ height: `${sensorData.waterLevel}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-900">{Math.round(sensorData.waterLevel)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Water Temperature
            </CardTitle>
            <CardDescription>Current water temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-32">
              <div className="text-5xl font-bold text-blue-800">
                {sensorData.temperature.toFixed(1)}
                <span className="text-2xl">°C</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {sensorData.temperature < 15 ? "Cold" : sensorData.temperature < 25 ? "Normal" : "Warm"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-blue-800">Water Quality History</CardTitle>
            <CardDescription>24-hour monitoring data</CardDescription>
          </CardHeader>
          <CardContent>
            <WaterQualityChart />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-800">Valve Controls</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch id="auto-mode" checked={isAutoMode} onCheckedChange={setIsAutoMode} />
                <Label htmlFor="auto-mode">Auto</Label>
              </div>
            </div>
            <CardDescription>
              {isAutoMode ? "System is in automatic mode" : "Manual valve control enabled"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ValveControls valves={sensorData.valves} onToggle={handleValveToggle} disabled={isAutoMode} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-blue-50">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="p-4 bg-white rounded-md mt-2">
          <h3 className="text-lg font-medium text-blue-800 mb-2">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              <span className="text-gray-700">Water Temperature:</span>
              <span className="font-medium">{sensorData.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-blue-500" />
              <span className="text-gray-700">Control Mode:</span>
              <span className="font-medium">{isAutoMode ? "Automatic" : "Manual"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              <span className="text-gray-700">Water Level:</span>
              <span className="font-medium">{Math.round(sensorData.waterLevel)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${systemState === "operational" ? "text-green-500" : systemState === "warning" ? "text-amber-500" : "text-red-500"}`}
              />
              <span className="text-gray-700">Alerts:</span>
              <span className="font-medium">
                {systemState === "operational"
                  ? "No alerts"
                  : systemState === "warning"
                    ? "Water quality warning"
                    : "Critical water quality issue"}
              </span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="p-4 bg-white rounded-md mt-2">
          <HistoryData />
        </TabsContent>
      </Tabs>
    </div>
  )
}
