"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type WeatherData = {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
  location: string
  soilTemp: number
  uvIndex: number
  rainfall24h: number
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    icon: "cloud-sun",
    location: "Greenfield County, GF",
    soilTemp: 58,
    uvIndex: 6,
    rainfall24h: 0.2,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching weather data for farm location
    const fetchWeather = async () => {
      setLoading(true)
      // In a real app, you would use coordinates: 42.3601, -71.0589
      // and fetch from OpenWeatherMap or similar API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock realistic farm weather data
      const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"]
      const icons = ["sun", "cloud-sun", "cloud", "cloud-rain", "sun"]
      const conditionIndex = Math.floor(Math.random() * conditions.length)

      setWeather({
        temperature: Math.floor(Math.random() * 25) + 55, // 55-80°F
        condition: conditions[conditionIndex],
        humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
        windSpeed: Math.floor(Math.random() * 12) + 3, // 3-15 mph
        icon: icons[conditionIndex],
        location: "Pretty Good Farms, Greenfield County",
        soilTemp: Math.floor(Math.random() * 20) + 45, // 45-65°F
        uvIndex: Math.floor(Math.random() * 8) + 2, // 2-10
        rainfall24h: Math.round(Math.random() * 1.5 * 10) / 10, // 0-1.5 inches
      })
      setLoading(false)
    }

    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (icon: string) => {
    const iconClass = "text-yellow-500"
    switch (icon) {
      case "sun":
        return (
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
            className={iconClass}
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
        )
      case "cloud-sun":
        return (
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
            className="text-gray-500"
          >
            <path d="M12 2v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="M20 12h2"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
            <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path>
            <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path>
          </svg>
        )
      case "cloud-rain":
        return (
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
            className="text-blue-500"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M16 14v6"></path>
            <path d="M8 14v6"></path>
            <path d="M12 16v6"></path>
          </svg>
        )
      default:
        return (
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
            className="text-gray-500"
          >
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
          </svg>
        )
    }
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🌤️ Current Farm Conditions
          <span className="text-sm font-normal text-gray-600">• Live Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-2xl font-bold text-gray-900">{weather.temperature}°F</div>
                <div className="text-sm text-gray-600">{weather.condition}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-600">Humidity</div>
              <div className="text-lg font-semibold text-blue-700">{weather.humidity}%</div>
              <div className="text-xs text-gray-500">Wind: {weather.windSpeed} mph</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-600">Soil Temp</div>
              <div className="text-lg font-semibold text-orange-700">{weather.soilTemp}°F</div>
              <div className="text-xs text-gray-500">UV Index: {weather.uvIndex}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-600">Rain (24h)</div>
              <div className="text-lg font-semibold text-green-700">{weather.rainfall24h}"</div>
              <div className="text-xs text-gray-500">Good for crops</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
