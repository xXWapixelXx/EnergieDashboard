<template>
  <div class="dashboard">
    <div class="header">
      <h1>Energy Dashboard</h1>
      <button 
        @click="importData" 
        :disabled="isLoading"
        class="import-button"
      >
        {{ isLoading ? 'Loading...' : 'Import Data' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="grid">
      <!-- Current Power Consumption -->
      <div class="card">
        <h2>Current Power Consumption</h2>
        <div class="value">
          {{ formatValue(currentPowerConsumption, 2) }} kW
        </div>
      </div>

      <!-- Solar Production -->
      <div class="card">
        <h2>Solar Production</h2>
        <div class="value">
          {{ formatValue(currentSolarPower, 2) }} kW
        </div>
      </div>

      <!-- Hydrogen Production -->
      <div class="card">
        <h2>Hydrogen Production</h2>
        <div class="value">
          {{ formatValue(currentHydrogenProduction, 2) }} L/h
        </div>
      </div>

      <!-- Battery Level -->
      <div class="card">
        <h2>Battery Level</h2>
        <div class="value">
          {{ formatValue(currentBatteryLevel, 1) }}%
        </div>
      </div>

      <!-- Temperature -->
      <div class="card">
        <h2>Temperature</h2>
        <div class="value">
          Inside: {{ formatValue(currentInsideTemperature, 1) }}°C<br>
          Outside: {{ formatValue(currentOutsideTemperature, 1) }}°C
        </div>
      </div>

      <!-- CO2 Level -->
      <div class="card">
        <h2>CO2 Level</h2>
        <div class="value">
          {{ currentCO2Level }} ppm
        </div>
      </div>
    </div>

    <!-- Charts will be added here -->
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useEnergyStore } from '../stores/energy'
import { storeToRefs } from 'pinia'

const store = useEnergyStore()
const { latestMeasurements, dailyAggregations, loading: isLoading, error } = storeToRefs(store)

const currentMeasurement = computed(() => latestMeasurements.value[0] || {})

const currentPowerConsumption = computed(() => currentMeasurement.value.power_consumption)
const currentSolarPower = computed(() => {
  const measurement = currentMeasurement.value
  return measurement.solar_voltage * measurement.solar_current
})
const currentHydrogenProduction = computed(() => currentMeasurement.value.hydrogen_production)
const currentBatteryLevel = computed(() => currentMeasurement.value.battery_level)
const currentInsideTemperature = computed(() => currentMeasurement.value.inside_temperature)
const currentOutsideTemperature = computed(() => currentMeasurement.value.outside_temperature)
const currentCO2Level = computed(() => currentMeasurement.value.co2_level || 0)

const formatValue = (value, decimals) => {
  if (value === undefined || value === null) return '0'.padEnd(decimals + 2, '0')
  return value.toFixed(decimals)
}

onMounted(async () => {
  await store.fetchLatestMeasurements()
  await store.fetchDailyAggregations()
})

const importData = async () => {
  await store.importData()
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.import-button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.import-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.value {
  font-size: 2rem;
  font-weight: bold;
  color: #2196F3;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style> 