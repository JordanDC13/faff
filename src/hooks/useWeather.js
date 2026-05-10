import { useState, useEffect } from 'react'

const WMO_CODES = {
  0: { label: 'Clear', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Icy fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  61: { label: 'Light rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  80: { label: 'Showers', emoji: '🌦️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
}

export function useWeather(coords) {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!coords) return

    const { lat, lng } = coords
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const code = data.current?.weathercode
        const temp = Math.round(data.current?.temperature_2m ?? 0)
        const info = WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' }
        setWeather({ temp, ...info, isRainy: [51, 61, 63, 65, 80, 95].includes(code) })
      })
      .catch(() => {
        // silently fail — weather is decorative
      })
  }, [coords?.lat, coords?.lng])

  return weather
}
