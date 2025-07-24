"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

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
}

const farmAreas: FarmArea[] = [
  {
    id: "crops",
    name: "Crop Fields",
    description: "Our organic vegetable fields where we grow seasonal produce using sustainable farming methods.",
    x: 50,
    y: 100,
    width: 300,
    height: 150,
    color: "#7c9e3d",
    hoverColor: "#8fb348",
  },
  {
    id: "orchard",
    name: "Fruit Orchard",
    description: "Home to our apple, pear, and peach trees that produce delicious organic fruit.",
    x: 400,
    y: 50,
    width: 200,
    height: 100,
    color: "#b5651d",
    hoverColor: "#c67529",
  },
  {
    id: "barn",
    name: "Main Barn",
    description: "Our historic barn houses farm equipment and serves as our main operations center.",
    x: 150,
    y: 300,
    width: 120,
    height: 80,
    color: "#a52a2a",
    hoverColor: "#c13434",
  },
  {
    id: "farmhouse",
    name: "Farmhouse",
    description: "The original farmhouse built in 1985, where our family lives and manages the farm.",
    x: 350,
    y: 280,
    width: 80,
    height: 60,
    color: "#daa520",
    hoverColor: "#eeb422",
  },
  {
    id: "pond",
    name: "Pond",
    description: "Our natural pond provides irrigation water and is home to various wildlife species.",
    x: 500,
    y: 200,
    width: 100,
    height: 100,
    color: "#4682b4",
    hoverColor: "#5a95c7",
  },
  {
    id: "market",
    name: "Farm Market",
    description: "Visit our market to purchase fresh produce directly from our farm.",
    x: 50,
    y: 30,
    width: 100,
    height: 50,
    color: "#9acd32",
    hoverColor: "#b3e142",
  },
]

export default function FarmMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredArea, setHoveredArea] = useState<FarmArea | null>(null)
  const [selectedArea, setSelectedArea] = useState<FarmArea | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 650, height: 400 })

  // Draw the farm map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#e9edc9"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw paths/roads
    ctx.beginPath()
    ctx.strokeStyle = "#d4a373"
    ctx.lineWidth = 8
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
    ctx.lineTo(200, 300)
    ctx.stroke()

    // Draw farm areas
    farmAreas.forEach((area) => {
      ctx.fillStyle = hoveredArea?.id === area.id ? area.hoverColor : area.color
      ctx.fillRect(area.x, area.y, area.width, area.height)

      // Add labels
      ctx.fillStyle = "#fff"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(area.name, area.x + area.width / 2, area.y + area.height / 2)
    })

    // Draw decorative elements
    // Trees
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      if (!isInAnyArea(x, y)) {
        drawTree(ctx, x, y)
      }
    }
  }, [hoveredArea, canvasSize])

  // Check if a point is inside any farm area
  const isInAnyArea = (x: number, y: number) => {
    return farmAreas.some((area) => x > area.x && x < area.x + area.width && y > area.y && y < area.y + area.height)
  }

  // Draw a simple tree
  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Tree trunk
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x - 5, y - 5, 10, 20)

    // Tree foliage
    ctx.beginPath()
    ctx.fillStyle = "#2e7d32"
    ctx.arc(x, y - 15, 15, 0, Math.PI * 2)
    ctx.fill()
  }

  // Handle mouse move to detect hovering over farm areas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const hovered = farmAreas.find(
      (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height,
    )

    setHoveredArea(hovered || null)

    // Change cursor style
    canvas.style.cursor = hovered ? "pointer" : "default"
  }

  // Handle click on farm areas
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clicked = farmAreas.find(
      (area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height,
    )

    setSelectedArea(clicked || null)
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(650, window.innerWidth - 40)
      setCanvasSize({
        width,
        height: 400 * (width / 650),
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
      <div className="w-full lg:w-2/3">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          className="border border-gray-300 rounded-lg shadow-sm w-full"
          style={{ maxWidth: "100%" }}
        />
        <p className="text-center text-sm text-green-700 mt-2">Click on any area to learn more</p>
      </div>
      <div className="w-full lg:w-1/3">
        {selectedArea ? (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-green-900 mb-2">{selectedArea.name}</h3>
              <p className="text-green-800">{selectedArea.description}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-green-900 mb-2">Farm Map</h3>
              <p className="text-green-800">Click on any area of the farm to learn more about it.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
