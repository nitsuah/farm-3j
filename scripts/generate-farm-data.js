// Generate crop data
const generateCropData = () => {
  const crops = [
    { name: "Corn", area: 45, yield: 180, organic: true },
    { name: "Soybeans", area: 35, yield: 55, organic: true },
    { name: "Wheat", area: 30, yield: 65, organic: true },
    { name: "Vegetables", area: 15, yield: 25, organic: true },
    { name: "Fruit Orchard", area: 10, yield: 15, organic: true },
    { name: "Pasture", area: 65, yield: 0, organic: true },
  ]

  // Add some random variation to the data
  return crops.map((crop) => ({
    ...crop,
    yield: crop.yield * (0.8 + Math.random() * 0.4), // Random variation of ±20%
    lastHarvest: randomDate(new Date(2023, 5, 1), new Date(2023, 9, 30)),
  }))
}

// Generate livestock data
const generateLivestockData = () => {
  return [
    { type: "Chickens", count: 250, freeRange: true },
    { type: "Cows", count: 35, freeRange: true },
    { type: "Pigs", count: 20, freeRange: true },
    { type: "Sheep", count: 45, freeRange: true },
  ]
}

// Generate weather history
const generateWeatherHistory = () => {
  const startDate = new Date(2023, 0, 1)
  const endDate = new Date()
  const weatherHistory = []

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    weatherHistory.push({
      date: new Date(d).toISOString().split("T")[0],
      temperature: Math.round(50 + Math.random() * 40), // 50-90°F
      rainfall: Math.round(Math.random() * 2 * 10) / 10, // 0-2 inches
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
    })
  }

  return weatherHistory
}

// Helper function to generate random dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split("T")[0]
}

// Generate soil health data
const generateSoilData = () => {
  const fields = ["North Field", "South Field", "East Field", "West Field", "Central Field"]

  return fields.map((field) => ({
    field,
    ph: (6 + Math.random() * 2).toFixed(1), // pH between 6.0 and 8.0
    nitrogen: Math.round(20 + Math.random() * 60), // 20-80 ppm
    phosphorus: Math.round(10 + Math.random() * 40), // 10-50 ppm
    potassium: Math.round(100 + Math.random() * 200), // 100-300 ppm
    organicMatter: (2 + Math.random() * 4).toFixed(1), // 2-6%
    lastTested: randomDate(new Date(2023, 0, 1), new Date(2023, 3, 30)),
  }))
}

// Combine all data
const farmData = {
  farmName: "PRETTY GOOD FARMS",
  location: {
    latitude: 42.3601,
    longitude: -71.0589, // Example coordinates
    address: "123 Farm Road, Greenfield County, GF 12345",
  },
  totalAcreage: 200,
  establishedYear: 1985,
  crops: generateCropData(),
  livestock: generateLivestockData(),
  soilData: generateSoilData(),
  weatherHistory: generateWeatherHistory().slice(0, 30), // Just keep last 30 days for brevity
}

// Output the data
console.log("Farm Data Generated:")
console.log(JSON.stringify(farmData, null, 2))

// In a real application, this data could be saved to a file or database
// fs.writeFileSync('farm-data.json', JSON.stringify(farmData, null, 2))

console.log("\nThis data could be used to:")
console.log("1. Create interactive visualizations of the farm")
console.log("2. Track crop yields and livestock health over time")
console.log("3. Analyze soil health and weather patterns")
console.log("4. Generate reports for sustainable farming practices")
