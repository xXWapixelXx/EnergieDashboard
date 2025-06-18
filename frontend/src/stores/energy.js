import { defineStore } from 'pinia'
import axios from 'axios'

export const useEnergyStore = defineStore('energy', {
  state: () => ({
    latestMeasurements: [],
    dailyAggregations: [],
    loading: false,
    error: null
  }),

  getters: {
    getLatestMeasurements: (state) => state.latestMeasurements,
    getDailyAggregations: (state) => state.dailyAggregations,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async fetchLatestMeasurements(limit = 100) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/measurements/latest?limit=${limit}`)
        this.latestMeasurements = response.data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching latest measurements:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchDailyAggregations(days = 7) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/measurements/daily?days=${days}`)
        this.dailyAggregations = response.data
      } catch (error) {
        this.error = error.message
        console.error('Error fetching daily aggregations:', error)
      } finally {
        this.loading = false
      }
    },

    async importData() {
      this.loading = true
      this.error = null
      try {
        await axios.get('/api/measurements/import')
        // Refresh data after import
        await this.fetchLatestMeasurements()
        await this.fetchDailyAggregations()
      } catch (error) {
        this.error = error.message
        console.error('Error importing data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}) 