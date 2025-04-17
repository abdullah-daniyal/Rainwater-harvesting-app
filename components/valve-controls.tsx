"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Droplet, Filter, Database } from "lucide-react"

interface ValveControlsProps {
  valves: {
    intake: boolean
    solenoidA: boolean
    solenoidB: boolean
  }
  onToggle: (valve: string, state: boolean) => void
  disabled: boolean
}

export default function ValveControls({ valves, onToggle, disabled }: ValveControlsProps) {
  const valveConfig = [
    {
      id: "intake",
      label: "Intake Valve",
      description: "Controls water intake from collection system",
      icon: <Droplet className="h-5 w-5 text-blue-500" />,
      state: valves.intake,
    },
    {
      id: "solenoidA",
      label: "Solenoid Valve A",
      description: "Controls primary water flow path",
      icon: <Filter className="h-5 w-5 text-blue-500" />,
      state: valves.solenoidA,
    },
    {
      id: "solenoidB",
      label: "Solenoid Valve B",
      description: "Controls secondary water flow path",
      icon: <Database className="h-5 w-5 text-blue-500" />,
      state: valves.solenoidB,
    },
  ]

  return (
    <div className="space-y-4">
      {disabled && (
        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mb-4">
          Switch to manual mode to control valves
        </div>
      )}

      {valveConfig.map((valve) => (
        <div key={valve.id} className="flex items-start space-x-3">
          <div className="mt-0.5">{valve.icon}</div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <Label htmlFor={valve.id} className="font-medium">
                {valve.label}
              </Label>
              <Switch
                id={valve.id}
                checked={valve.state}
                onCheckedChange={(checked) => onToggle(valve.id, checked)}
                disabled={disabled}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{valve.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
