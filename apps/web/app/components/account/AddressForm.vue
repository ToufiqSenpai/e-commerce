<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { Strapi5ResponseMany } from '@nuxtjs/strapi'
import type { Address, Area, AreaResponse } from '~/types/strapi/address'

const props = defineProps<{
  id?: string
}>()

const { create, find, findOne, update } = useStrapi()
const client = useStrapiClient()
const { data: existingAddresses } = await useAsyncData<Strapi5ResponseMany<Address>>('addresses', () =>
  find('addresses'),
)
const hasNoAddresses = computed(() => !existingAddresses.value?.data?.length)

const form = reactive({
  recipientName: '',
  phone: '',
  province: '',
  city: '', // Matches Address interface 'city'
  district: '',
  postalCode: '',
  address: '',
  latitude: 0,
  longitude: 0,
  isDefault: hasNoAddresses.value,
})

const { data: provincesResponse } = await useAsyncData('provinces', () => client<AreaResponse>('addresses/provinces'))
const provinces = computed<Area[]>(() => provincesResponse.value?.data || [])

// Local selection models for dropdowns
const selectedProvince = ref<Area | null>(null)
const selectedRegency = ref<Area | null>(null)
const selectedDistrict = ref<Area | null>(null)

const loadingRegencies = ref(false)
const regencies = ref<Area[]>([])

watch(selectedProvince, async (newValue) => {
  selectedRegency.value = null
  selectedDistrict.value = null
  regencies.value = []
  districts.value = []

  if (newValue) {
    loadingRegencies.value = true
    const { data: regenciesResponse } = await useAsyncData('regencies', () =>
      client<AreaResponse>(`addresses/regencies/${newValue.code}`),
    )
    regencies.value = regenciesResponse.value?.data ?? []
    loadingRegencies.value = false
  }
})

const loadingDistricts = ref(false)
const districts = ref<Area[]>([])

watch(selectedRegency, async (newValue) => {
  selectedDistrict.value = null
  districts.value = []

  if (newValue) {
    loadingDistricts.value = true
    const { data: districtsResponse } = await useAsyncData('districts', () =>
      client<AreaResponse>(`addresses/districts/${newValue.code}`),
    )
    districts.value = districtsResponse.value?.data ?? []
    loadingDistricts.value = false
  }
})

// Edit Mode Load State
const loadingAddress = ref(false)
let initialProvinceName = ''
let initialCityName = ''
let initialDistrictName = ''

const matchProvince = () => {
  if (provinces.value.length > 0 && initialProvinceName) {
    const match = provinces.value.find((p) => p.name.toUpperCase() === initialProvinceName.toUpperCase())
    if (match) {
      selectedProvince.value = match
      initialProvinceName = ''
    }
  }
}

watch(
  provinces,
  (newProvinces) => {
    if (newProvinces.length > 0 && initialProvinceName) {
      matchProvince()
    }
  },
  { immediate: true },
)

watch(regencies, (newRegencies) => {
  if (newRegencies.length > 0 && initialCityName) {
    const match = newRegencies.find((r) => r.name.toUpperCase() === initialCityName.toUpperCase())
    if (match) {
      selectedRegency.value = match
      initialCityName = ''
    }
  }
})

watch(districts, (newDistricts) => {
  if (newDistricts.length > 0 && initialDistrictName) {
    const match = newDistricts.find((d) => d.name.toUpperCase() === initialDistrictName.toUpperCase())
    if (match) {
      selectedDistrict.value = match
      initialDistrictName = ''
    }
  }
})

onMounted(async () => {
  if (props.id) {
    try {
      loadingAddress.value = true
      const response = await findOne<Address>('addresses', props.id)
      const addr = response.data
      if (addr) {
        form.recipientName = addr.recipientName
        form.phone = addr.phone
        form.address = addr.address
        form.postalCode = addr.postalCode
        form.latitude = addr.latitude
        form.longitude = addr.longitude
        form.isDefault = addr.isDefault ?? false

        // Store names to match in watchers
        initialProvinceName = addr.province
        initialCityName = addr.city
        initialDistrictName = addr.district

        matchProvince()
      }
    } catch (error) {
      console.error('Failed to fetch address details:', error)
    } finally {
      loadingAddress.value = false
    }
  }
})

const loading = ref(false)

const saveAddress = async () => {
  try {
    loading.value = true

    // Map selection names to form payload
    form.province = selectedProvince.value?.name || ''
    form.city = selectedRegency.value?.name || ''
    form.district = selectedDistrict.value?.name || ''

    if (props.id) {
      await update<Address>('addresses', props.id, form)
    } else {
      await create<Address>('addresses', form)
    }

    clearNuxtData('addresses')
    navigateTo('/account/address')
  } catch (error) {
    console.error('Failed to save address:', error)
    throw error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium">{{ id ? 'Edit Address' : 'Add New Address' }}</h3>
      <p class="text-sm text-muted-foreground">
        {{ id ? 'Update your shipping address details.' : 'Enter your new shipping address details.' }}
      </p>
    </div>

    <div
      v-if="loadingAddress"
      class="text-sm text-muted-foreground py-12 text-center border border-dashed border-border rounded-xl"
    >
      Loading address details...
    </div>

    <form v-else @submit.prevent="saveAddress" class="space-y-5 w-full">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Recipient Name</label>
          <input
            v-model="form.recipientName"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Phone Number</label>
          <input
            v-model="form.phone"
            type="tel"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="081234567890"
          />
        </div>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">Full Address</label>
        <textarea
          v-model="form.address"
          required
          rows="3"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Jl. Sudirman No. 123, RT 01/RW 02"
        ></textarea>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Province</label>
          <select
            v-model="selectedProvince"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option :value="null" disabled>Select Province</option>
            <option v-for="prov in provinces" :key="prov.code" :value="prov">
              {{ prov.name }}
            </option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">City / Regency</label>
          <select
            v-model="selectedRegency"
            required
            :disabled="!selectedProvince"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option :value="null" disabled>
              {{ loadingRegencies ? 'Loading...' : 'Select City / Regency' }}
            </option>
            <option v-for="reg in regencies" :key="reg.code" :value="reg">
              {{ reg.name }}
            </option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">District</label>
          <select
            v-model="selectedDistrict"
            required
            :disabled="!selectedRegency"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option :value="null" disabled>
              {{ loadingDistricts ? 'Loading...' : 'Select District' }}
            </option>
            <option v-for="district in districts" :key="district.code" :value="district">
              {{ district.name }}
            </option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Postal Code</label>
          <input
            v-model="form.postalCode"
            required
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="12190"
          />
        </div>
      </div>

      <!-- Pinpoint Map Section -->
      <div class="space-y-2">
        <label class="text-sm font-medium flex items-center justify-between">
          <span>Pinpoint Location</span>
          <span class="text-xs text-muted-foreground font-normal"
            >Drag the pin or click the map to set exact coordinates</span
          >
        </label>

        <ClientOnly>
          <AddressMap v-model:latitude="form.latitude" v-model:longitude="form.longitude" />
          <template #fallback>
            <div
              class="w-full rounded-xl border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground"
              style="height: 320px"
            >
              Loading map...
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isDefault"
          v-model="form.isDefault"
          :disabled="hasNoAddresses"
          class="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label
          for="isDefault"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
        >
          Set as default address
          <span v-if="hasNoAddresses" class="text-xs text-muted-foreground font-normal"
            >(First address is default)</span
          >
        </label>
      </div>

      <div class="flex gap-4 pt-4 border-t border-border mt-6">
        <button
          type="button"
          @click="navigateTo('/account/address')"
          class="h-10 px-4 py-2 flex-1 rounded-md border border-input bg-background hover:bg-muted hover:text-foreground text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="h-10 px-4 py-2 flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Save Address' }}
        </button>
      </div>
    </form>
  </div>
</template>
