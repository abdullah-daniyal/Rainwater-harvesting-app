"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface SensorGaugeProps {
  value: number
  min: number
  max: number
  idealMin: number
  idealMax: number
  unit: string
  colorScheme: string
  inverted?: boolean
}

export default function SensorGauge({
  value,
  min,
  max,
  idealMin,
  idealMax,
  unit,
  colorScheme,
  inverted = false,
}: SensorGaugeProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const percentage = ((value - min) / (max - min)) * 100
    setProgress(percentage)
  }, [value, min, max])

  const getStatusColor = () => {
    if (inverted) {
      if (value <= idealMax) return "bg-green-500"
      if (value <= idealMax * 2) return "bg-amber-500"
      return "bg-red-500"
    } else {
      if (value >= idealMin && value <= idealMax) return "bg-green-500"
      if (value >= idealMin - idealMin * 0.1 && value <= idealMax + idealMax * 0.1) return "bg-amber-500"
      return "bg-red-500"
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {min} {unit}
        </span>
        <span className="text-sm text-gray-500">
          {max} {unit}
        </span>
      </div>

      <Progress value={progress} className="h-3" indicatorClassName={getStatusColor()} />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Ideal: {idealMin}-{idealMax} {unit}
        </div>
        <div className="text-2xl font-bold text-blue-800">
          {value.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
        </div>
      </div>
    </div>
  )
}
