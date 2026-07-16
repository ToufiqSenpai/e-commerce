<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define models for latitude and longitude using Vue 3.4+ defineModel
const latitude = defineModel<number>('latitude', { required: true })
const longitude = defineModel<number>('longitude', { required: true })

const mapElement = ref<HTMLElement | null>(null)
const locatingGPS = ref(false)
let leafletMap: L.Map | null = null
let leafletMarker: L.Marker | null = null

const defaultCoords = { lat: -6.2, lng: 106.816666 } // Jakarta

const initMap = (lat: number, lng: number) => {
  if (!mapElement.value) return

  latitude.value = lat
  longitude.value = lng

  if (!leafletMap) {
    leafletMap = L.map(mapElement.value).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap)

    const customIcon = L.divIcon({
      html: `
        <div style="display: flex; justify-content: center; align-items: center; width: 36px; height: 36px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="36px" height="36px" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.35));">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      className: 'custom-marker-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    })

    leafletMarker = L.marker([lat, lng], {
      draggable: true,
      icon: customIcon,
    }).addTo(leafletMap)

    // Listen to marker drag events
    leafletMarker.on('dragend', () => {
      const position = leafletMarker?.getLatLng()
      if (position) {
        latitude.value = position.lat
        longitude.value = position.lng
      }
    })

    // Listen to map click events
    leafletMap.on('click', (e) => {
      leafletMarker?.setLatLng(e.latlng)
      latitude.value = e.latlng.lat
      longitude.value = e.latlng.lng
    })
  } else {
    leafletMap.setView([lat, lng], 13)
    leafletMarker?.setLatLng([lat, lng])
  }
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    return
  }

  locatingGPS.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords
      initMap(lat, lng)
      locatingGPS.value = false
    },
    (error) => {
      console.warn('Geolocation error, falling back to default:', error)
      locatingGPS.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

onMounted(() => {
  const initialLat = latitude.value || defaultCoords.lat
  const initialLng = longitude.value || defaultCoords.lng

  // Initialize map immediately with initial or default coordinates
  initMap(initialLat, initialLng)

  // Request user's current GPS location if it's a new address (coords are 0)
  if (!latitude.value && !longitude.value) {
    getUserLocation()
  }
})

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<template>
  <div
    class="relative w-full rounded-xl overflow-hidden border border-border shadow-inner bg-muted"
    style="height: 320px"
  >
    <div ref="mapElement" class="w-full h-full" style="z-index: 10"></div>

    <!-- Loading Indicator overlay -->
    <div
      v-if="locatingGPS"
      class="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-20 transition-opacity"
    >
      <div class="flex items-center gap-2 bg-card px-4 py-2.5 rounded-lg border shadow-sm">
        <svg
          class="animate-spin h-4 w-4 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-xs font-medium">Locating via GPS...</span>
      </div>
    </div>

    <!-- Locate button overlay -->
    <button
      type="button"
      @click="getUserLocation"
      class="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground shadow-sm hover:bg-muted transition-colors cursor-pointer"
      title="Get current location"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
:deep(.custom-marker-icon) {
  background: transparent !important;
  border: none !important;
}
</style>
