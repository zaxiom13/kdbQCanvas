package org.example.util

// Utility functions for formatting time values
fun formatTimeAsMs(timeValue: Long): String {
    val hours = timeValue / 3600000
    val minutes = (timeValue % 3600000) / 60000
    val seconds = (timeValue % 60000) / 1000
    val millis = timeValue % 1000
    
    return String.format("%02d:%02d:%02d.%03d", hours, minutes, seconds, millis)
}

fun formatTimeAsNs(timeValue: Long): String {
    val milliseconds = timeValue / 1_000_000
    val seconds = milliseconds / 1000
    val minutes = seconds / 60
    val hours = minutes / 60
    
    val remainingMinutes = minutes % 60
    val remainingSeconds = seconds % 60
    val remainingMillis = milliseconds % 1000
    
    return String.format("%02d:%02d:%02d.%03d", hours, remainingMinutes, remainingSeconds, remainingMillis)
}
