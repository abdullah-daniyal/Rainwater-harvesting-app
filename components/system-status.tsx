"use client"

import { CircleOff, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Update the SystemStatusProps interface to include systemOn
interface SystemStatusProps {
  state: "operational" | "warning" | "error"
  waterLevel: number
  systemOn?: boolean
}

// Update the component to handle the systemOn prop
export default function SystemStatus({ state, waterLevel, systemOn = true }: SystemStatusProps) {
  // If system is off, show a different status
  if (!systemOn) {
    return (
      <div className="flex flex-col items-center text-center">
        <CircleOff className="h-12 w-12 text-gray-400" />
        <h3 className="mt-2 font-bold text-gray-500">System Offline</h3>
        <p className="text-sm text-gray-500 mt-1">The system is currently turned off</p>

        <div className="w-full mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Water Level</span>
            <span className="font-medium">{Math.round(waterLevel)}%</span>
          </div>
          <Progress value={waterLevel} className="h-2" indicatorClassName="bg-gray-300" />
        </div>
      </div>
    )
  }

  // Rest of the component remains the same
  const getStatusIcon = () => {
    switch (state) {
      case "operational":
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case "warning":
        return <AlertCircle className="h-12 w-12 text-amber-500" />
      case "error":
        return <CircleOff className="h-12 w-12 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (state) {
      case "operational":
        return "System Operational"
      case "warning":
        return "Warning: Check Parameters"
      case "error":
        return "Error: Maintenance Required"
    }
  }

  const getStatusDescription = () => {
    switch (state) {
      case "operational":
        return "All systems functioning normally"
      case "warning":
        return "Water quality parameters outside ideal range"
      case "error":
        return "Critical issue detected, system needs attention"
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      {getStatusIcon()}
      <h3
        className={`mt-2 font-bold ${
          state === "operational" ? "text-green-700" : state === "warning" ? "text-amber-700" : "text-red-700"
        }`}
      >
        {getStatusText()}
      </h3>
      <p className="text-sm text-gray-600 mt-1">{getStatusDescription()}</p>

      <div className="w-full mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Water Level</span>
          <span className="font-medium">{Math.round(waterLevel)}%</span>
        </div>
        <Progress
          value={waterLevel}
          className="h-2"
          indicatorClassName={`${waterLevel > 90 ? "bg-blue-600" : waterLevel > 30 ? "bg-blue-400" : "bg-amber-500"}`}
        />
      </div>
    </div>
  )
}
