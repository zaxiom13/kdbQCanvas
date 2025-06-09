// This file contains utility functions for debugging Q responses

// Time-specific utilities
export const debugTimeValue = (value) => {
  // Try to identify and parse different time formats
  console.group('Time Value Debug')
  console.log('Raw value:', value)
  console.log('Type:', typeof value)
  
  if (typeof value === 'string') {
    console.log('String representation:', value)
    
    // Try to parse as ISO time string
    try {
      const date = new Date(value)
      console.log('Parsed as Date:', date.toISOString())
    } catch (err) {
      console.log('Failed to parse as Date:', err.message)
    }
    
    // Try to parse as HH:MM:SS.mmm format
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(value)) {
      const [time, millis] = value.split('.')
      const [hours, minutes, seconds] = time.split(':').map(Number)
      console.log('Parsed as time parts:', { hours, minutes, seconds, millis })
      
      // Calculate milliseconds since midnight
      const msSinceMidnight = (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + Number(millis)
      console.log('Milliseconds since midnight:', msSinceMidnight)
    }
  } 
  else if (typeof value === 'number') {
    console.log('Numeric value:', value)
    
    // For values less than a day in milliseconds, likely milliseconds since midnight
    if (value < 86400000) {
      // Interpret as milliseconds since midnight
      const hours = Math.floor(value / 3600000)
      const minutes = Math.floor((value % 3600000) / 60000)
      const seconds = Math.floor((value % 60000) / 1000)
      const millis = value % 1000
      
      console.log('As time (ms since midnight):', 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`)
    }
    
    // Interpret as nanoseconds since midnight (useful for some KDB+ time formats)
    if (value > 86400000) {
      const nsValue = value / 1000000
      const nsHours = Math.floor(nsValue / 3600000)
      const nsMinutes = Math.floor((nsValue % 3600000) / 60000)
      const nsSeconds = Math.floor((nsValue % 60000) / 1000)
      const nsMillis = Math.floor(nsValue % 1000)
      
      console.log('As time (ns since midnight):', 
        `${nsHours.toString().padStart(2, '0')}:${nsMinutes.toString().padStart(2, '0')}:${nsSeconds.toString().padStart(2, '0')}.${nsMillis.toString().padStart(3, '0')}`)
    }
    
    // Also show how this compares to current system time
    const now = new Date()
    const midnight = new Date(now).setHours(0, 0, 0, 0)
    const systemMs = now.getTime() - midnight
    console.log('Current system ms since midnight:', systemMs)
    console.log('Difference from system time (ms):', value - systemMs)
  } 
  else if (value && typeof value === 'object') {
    console.log('Object properties:', Object.keys(value))
    
    // For special time objects
    if ('toString' in value) {
      console.log('String representation:', value.toString())
    }
  }
  
  console.groupEnd()
}

// General response debug utility
export const debugQResponse = (query, response) => {
  console.group(`Q Response Debug: ${query}`)
  console.log('Full response:', response)
  
  if (response) {
    console.log('Success:', response.success)
    console.log('Data Type:', response.dataType)
    console.log('Data:', response.data)
    console.log('Error:', response.error)
    
    // Special handling for time queries
    if (query.trim() === '.z.t' || response.dataType === 'Time') {
      debugTimeValue(response.data)
    }
  }
  
  console.groupEnd()
}

export default {
  debugTimeValue,
  debugQResponse
}
