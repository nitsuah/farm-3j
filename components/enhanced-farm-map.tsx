"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import WeatherWidget from "./weather-widget"

type FarmArea = {
  id: string
  name: string
  description: string
  x: number
  y: number
  width: number
  height: number
  color: string
  hoverColor: string
  currentCrop?: string
  plantedDate?: string
  harvestDate?: string
  assignedEquipment?: string[]
  assignedAnimals?: string[]
  soilMoisture?: number
  lastWatered?: string
  notes?: string
}

const farmAreas: FarmArea[] = [
  {
    id: "crops",
    name: "North Crop Fields",
    description: "Our main vegetable production area with rotating seasonal crops.",
    x: 50,
    y: 80,
    width: 350,
    height: 180,
    color: "#7c9e3d",
    hoverColor: "#8fb348",
    currentCrop: "Winter Wheat",
    plantedDate: "October 15, 2024",
    harvestDate: "June 2025",
    assignedEquipment: ["John Deere 6120M Tractor", "Seed Drill", "Irrigation System"],
    soilMoisture: 78,
    lastWatered: "2 days ago",
    notes: "Excellent growth this season. Soil pH optimal at 6.8.",
  },
  {
    id: "orchard",
    name: "Heritage Fruit Orchard",
    description: "Organic apple, pear, and peach trees planted in 1987.",
    x: 450,
    y: 40,
    width: 200,
    height: 120,
    color: "#b5651d",
    hoverColor: "#c67529",
    currentCrop: "Apple Trees (Honeycrisp, Gala)",
    plantedDate: "Spring 1987",
    harvestDate: "September - October",
    assignedEquipment: ["Orchard Sprayer", "Pruning Tools"],
    assignedAnimals: ["Honeybees (3 hives)"],
    soilMoisture: 65,
    lastWatered: "Natural rainfall",
    notes: "Pruning completed in February. Expecting good harvest.",
  },
  {
    id: "barn",
    name: "Main Equipment Barn",
    description: "Central hub for farm operations and equipment storage.",
    x: 150,
    y: 320,
    width: 140,
    height: 90,
    color: "#a52a2a",
    hoverColor: "#c13434",
    assignedEquipment: ["Combine Harvester", "Hay Baler", "Various Tools", "Workshop"],
    assignedAnimals: ["Barn Cats (Whiskers & Mittens)", "Barn Owl"],
    notes: "Recently upgraded electrical system. New hay storage added.",
  },
  {
    id: "farmhouse",
    name: "Johnson Family Farmhouse",
    description: "Home base and farm office since 1985.",
    x: 350,
    y: 300,
    width: 100,
    height: 80,
    color: "#daa520",
    hoverColor: "#eeb422",
    assignedAnimals: ["Farm Dog (Rusty)", "Chickens (12 hens)"],
    notes: "Solar panels installed 2023. Home office manages farm operations.",
  },
  {
    id: "pond",
    name: "Irrigation Pond",
    description: "Natural water source supporting farm irrigation and wildlife.",
    x: 520,
    y: 200,
    width: 120,
    height: 120,
    color: "#4682b4",
    hoverColor: "#5a95c7",
    assignedAnimals: ["Wild Ducks", "Frogs", "Bass & Bluegill", "Great Blue Heron"],
    assignedEquipment: ["Water Pump", "Irrigation Lines"],
    soilMoisture: 100,
    notes: "Water levels good. Supports 40% of farm irrigation needs.",
  },
  {
    id: "market",
    name: "Farm Market Stand",
    description: "Direct-to-consumer sales of fresh farm produce.",
    x: 50,
    y: 20,
    width: 120,
    height: 60,
    color: "#9acd32",
    hoverColor: "#b3e142",
    assignedEquipment: ["Refrigerated Display Cases", "Cash Register", "Scales"],
    notes: "Open weekends. Average 150 customers per week.",
  },
  {
    id: "pasture",
    name: "South Pasture",
    description: "Rotational grazing area for livestock.",
    x: 80,
    y: 450,
    width: 400,
    height: 100,
    color: "#90EE90",
    hoverColor: "#98FB98",
    currentCrop: "Mixed Grass Pasture",
    assignedAnimals: ["12 Holstein Cows", "3 Quarter Horses", "Guardian Llama (Larry)"],
    assignedEquipment: ["Mobile Water Trough", "Fence Posts"],
    soilMoisture: 72,
    notes: "Rotated livestock last week. Grass recovering well.",
  },
]

// Fixed tree positions
const treePositions = [
  { x: 120, y: 250 },
  { x: 300, y: 180 },
  { x: 480, y: 350 },
  { x: 200, y: 420 },
  { x: 580, y: 100 },
  { x: 400, y: 480 },
  { x: 160, y: 150 },
  { x: 520, y: 380 },
  { x: 320, y: 400 },
  { x: 450, y: 250 },
]

export default function EnhancedFarmMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredArea, setHoveredArea] = useState<FarmArea | null>(null)
  const [selectedArea, setSelectedArea] = useState<FarmArea | null>(null)
  const [hoveredIcon, setHoveredIcon] = useState<{ type: string; text: string; x: number; y: number } | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 600 })

  // Draw the enhanced farm map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background with subtle texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f0f4e8")
    gradient.addColorStop(1, "#e8f0e4")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw farm roads/paths
    ctx.beginPath()
    ctx.strokeStyle = "#d4a373"
    ctx.lineWidth = 12
    ctx.lineCap = "round"
    ctx.moveTo(100, 50)
    ctx.lineTo(200, 150)
    ctx.lineTo(300, 200)
    ctx.lineTo(400, 300)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = "#d4a373"
    ctx.lineWidth = 8
    ctx.moveTo(500, 100)
    ctx.lineTo(400, 200)
    ctx.lineTo(200, 350)
    ctx.stroke()

    // Draw farm areas with enhanced styling
    farmAreas.forEach((area) => {
      const isHovered = hoveredArea?.id === area.id
      const isSelected = selectedArea?.id === area.id

      // Add shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = isHovered ? 8 : 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillStyle = isHovered ? area.hoverColor : area.color
      ctx.fillRect(area.x, area.y, area.width, area.height)

      // Add border for selected area
      if (isSelected) {
        ctx.strokeStyle = "#2563eb"
        ctx.lineWidth = 3
        ctx.strokeRect(area.x - 2, area.y - 2, area.width + 4, area.height + 4)
      }

      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Enhanced labels with better typography
      ctx.fillStyle = "#fff"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
      ctx.lineWidth = 3
      ctx.strokeText(area.name, area.x + area.width / 2, area.y + area.height / 2 - 10)
      ctx.fillText(area.name, area.x + area.width / 2, area.y + area.height / 2 - 10)

      // Draw icons for each area
      drawAreaIcons(ctx, area)
    })

    // Draw fixed trees
    treePositions.forEach((pos) => {
      if (!isInAnyArea(pos.x, pos.y)) {
        drawEnhancedTree(ctx, pos.x, pos.y)
      }
    })
  }, [hoveredArea, selectedArea, canvasSize])

  // Draw icons for farm area attributes
  const drawAreaIcons = (ctx: CanvasRenderingContext2D, area: FarmArea) => {
    let iconX = area.x + 10
    let iconY = area.y + area.height - 30

    // Crop icon
    if (area.currentCrop) {
      drawIcon(ctx, "🌾", iconX, iconY)
      iconX += 25
    }

    // Equipment icons
    if (area.assignedEquipment && area.assignedEquipment.length > 0) {
      if (area.assignedEquipment.some((eq) => eq.toLowerCase().includes("tractor"))) {
        drawIcon(ctx, "🚜", iconX, iconY)
        iconX += 25
      }
      if (area.assignedEquipment.some((eq) => eq.toLowerCase().includes("harvester"))) {
        drawIcon(ctx, "🏗️", iconX, iconY)
        iconX += 25
      }
      if (area.assignedEquipment.some((eq) => eq.toLowerCase().includes("sprayer"))) {
        drawIcon(ctx, "💧", iconX, iconY)
        iconX += 25
      }
      if (area.assignedEquipment.some((eq) => eq.toLowerCase().includes("pump"))) {
        drawIcon(ctx, "⚙️", iconX, iconY)
        iconX += 25
      }
    }

    // Animal icons
    if (area.assignedAnimals && area.assignedAnimals.length > 0) {
      // Reset to second row if needed
      if (iconX > area.x + area.width - 30) {
        iconX = area.x + 10
        iconY += 25
      }

      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("cow"))) {
        drawIcon(ctx, "🐄", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("horse"))) {
        drawIcon(ctx, "🐴", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("duck"))) {
        drawIcon(ctx, "🦆", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("cat"))) {
        drawIcon(ctx, "🐱", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("dog"))) {
        drawIcon(ctx, "🐕", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("chicken"))) {
        drawIcon(ctx, "🐔", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("bee"))) {
        drawIcon(ctx, "🐝", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("llama"))) {
        drawIcon(ctx, "🦙", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("owl"))) {
        drawIcon(ctx, "🦉", iconX, iconY)
        iconX += 25
      }
      if (area.assignedAnimals.some((animal) => animal.toLowerCase().includes("heron"))) {
        drawIcon(ctx, "🦆", iconX, iconY)
        iconX += 25
      }
    }

    // Soil moisture indicator
    if (area.soilMoisture) {
      if (iconX > area.x + area.width - 30) {
        iconX = area.x + 10
        iconY += 25
      }
      const moistureIcon = area.soilMoisture > 80 ? "💧" : area.soilMoisture > 60 ? "🌊" : "🏜️"
      drawIcon(ctx, moistureIcon, iconX, iconY)
    }
  }

  // Helper function to draw emoji icons
  const drawIcon = (ctx: CanvasRenderingContext2D, emoji: string, x: number, y: number) => {
    ctx.font = "16px Arial"
    ctx.fillText(emoji, x, y)
  }

  // Check if a point is inside any farm area
  const isInAnyArea = (x: number, y: number) => {
    return farmAreas.some((area) => x > area.x && x < area.x + area.width && y > area.y && y < area.y + area.height)
  }

  // Enhanced tree drawing
  const drawEnhancedTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Tree trunk with gradient
    const trunkGradient = ctx.createLinearGradient(x - 8, y - 10, x + 8, y + 20)
    trunkGradient.addColorStop(0, "#8B4513")
    trunkGradient.addColorStop(1, "#654321")
    ctx.fillStyle = trunkGradient
    ctx.fillRect(x - 8, y - 10, 16, 30)

    // Tree foliage with multiple shades
    const foliageGradient = ctx.createRadialGradient(x, y - 20, 5, x, y - 20, 25)
    foliageGradient.addColorStop(0, "#4a7c59")
    foliageGradient.addColorStop(1, "#2e7d32")

    ctx.beginPath()
    ctx.fillStyle = foliageGradient
    ctx.arc(x, y - 20, 25, 0, Math.PI * 2)
    ctx.fill()

    // Add smaller foliage details
    ctx.beginPath()
    ctx.fillStyle = "#388e3c"
    ctx.arc(x - 10, y - 15, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.arc(x + 12, y - 25, 10, 0, Math.PI * 2)
    ctx.fill()
  }

  // Handle mouse interactions with better hit detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const hovered = farmAreas.find(
      (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height,
    )

    setHoveredArea(hovered || null)
    canvas.style.cursor = hovered ? "pointer" : "default"

    // Check for icon hover (simplified - you could make this more precise)
    setHoveredIcon(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const clicked = farmAreas.find(
      (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height,
    )

    setSelectedArea(clicked || null)
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(700, window.innerWidth - 40)
      setCanvasSize({
        width,
        height: 600 * (width / 700),
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full">
      {/* Weather Widget */}
      <div className="mb-6">
        <WeatherWidget />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className="border border-gray-300 rounded-lg shadow-lg w-full bg-white"
            style={{ maxWidth: "100%" }}
          />
          <div className="mt-3 text-center">
            <p className="text-sm text-green-700 mb-2">
              🖱️ Hover over areas to see details • Click to view full information
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-600">
              <span>🌾 Crops</span>
              <span>🚜 Equipment</span>
              <span>🐄 Animals</span>
              <span>💧 Irrigation</span>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96">
          {selectedArea ? (
            <Card className="h-fit">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">{selectedArea.name}</h3>
                    <p className="text-green-800 text-sm">{selectedArea.description}</p>
                  </div>

                  {selectedArea.currentCrop && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-1">🌱 Current Crop</h4>
                      <p className="text-sm text-green-800">{selectedArea.currentCrop}</p>
                      {selectedArea.plantedDate && (
                        <p className="text-xs text-green-600 mt-1">Planted: {selectedArea.plantedDate}</p>
                      )}
                      {selectedArea.harvestDate && (
                        <p className="text-xs text-green-600">Harvest: {selectedArea.harvestDate}</p>
                      )}
                    </div>
                  )}

                  {selectedArea.assignedEquipment && selectedArea.assignedEquipment.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-1">🚜 Equipment</h4>
                      <ul className="text-sm text-orange-800">
                        {selectedArea.assignedEquipment.map((equipment, index) => (
                          <li key={index}>• {equipment}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedArea.assignedAnimals && selectedArea.assignedAnimals.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-1">🐄 Animals</h4>
                      <ul className="text-sm text-blue-800">
                        {selectedArea.assignedAnimals.map((animal, index) => (
                          <li key={index}>• {animal}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedArea.soilMoisture && (
                    <div className="bg-cyan-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-cyan-900 mb-1">💧 Soil Conditions</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-cyan-800">Moisture Level</span>
                        <span className="font-bold text-cyan-900">{selectedArea.soilMoisture}%</span>
                      </div>
                      {selectedArea.lastWatered && (
                        <p className="text-xs text-cyan-600 mt-1">Last watered: {selectedArea.lastWatered}</p>
                      )}
                    </div>
                  )}

                  {selectedArea.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-1">📝 Notes</h4>
                      <p className="text-sm text-gray-700">{selectedArea.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-fit">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-green-900 mb-2">🗺️ Interactive Farm Map</h3>
                <p className="text-green-800 mb-4">
                  Explore our 200-acre sustainable farm! Each area shows live icons for crops, equipment, and animals.
                  Click on any area for detailed information.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Crop Fields & Pastures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                    <span>Orchard & Fruit Trees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>Buildings & Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Water Sources</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
