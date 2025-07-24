"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SunNavProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function SunNav({ activeSection, onSectionChange }: SunNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sections = [
    { id: "explore", label: "Explore", icon: "🗺️" },
    { id: "about", label: "About", icon: "🌱" },
    { id: "contact", label: "Contact", icon: "📞" },
  ]

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Main sun button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white shadow-lg transition-all duration-300 flex items-center justify-center relative",
          isOpen && "scale-110",
        )}
      >
        {/* Sun rays around the button */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 bg-gradient-to-t from-yellow-400 to-orange-300 transition-all duration-300",
                isOpen ? "h-6 opacity-100" : "h-3 opacity-60",
              )}
              style={{
                left: "50%",
                top: "50%",
                transformOrigin: "bottom center",
                transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-${isOpen ? "45px" : "35px"})`,
              }}
            />
          ))}
        </div>

        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform duration-300", isOpen && "rotate-180")}
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>

      {/* Navigation triangle buttons */}
      {isOpen && (
        <div className="absolute top-0 right-0">
          {sections.map((section, index) => {
            // Position triangles southwest of the sun button
            const positions = [
              { x: -160, y: 60 }, // Explore - southwest
              { x: -120, y: 100 }, // About - further southwest
              { x: -80, y: 140 }, // Contact - even further southwest
            ]

            const position = positions[index]

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={cn(
                  "absolute shadow-lg transition-all duration-500 flex flex-col items-center justify-center text-xs font-medium transform animate-in slide-in-from-right-5",
                  activeSection === section.id ? "text-white scale-110" : "text-orange-800 hover:scale-105",
                )}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  animationDelay: `${index * 100}ms`,
                  width: 0,
                  height: 0,
                  borderLeft: "30px solid transparent",
                  borderRight: "30px solid transparent",
                  borderBottom: activeSection === section.id ? "40px solid #ea580c" : "40px solid #fed7aa",
                  backgroundColor: "transparent",
                }}
              >
                <div
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    top: "15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60px",
                  }}
                >
                  <span className="text-lg mb-1">{section.icon}</span>
                  <span className="text-[10px] font-semibold whitespace-nowrap">{section.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-10 z-[-1]" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
