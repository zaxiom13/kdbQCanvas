package org.example

import org.example.config.CommunicationConfig
import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.example.QIPC.QueryResponse
import org.example.communication.DualBandCommunicationManager
import org.example.communication.ChannelType
import kotlinx.coroutines.runBlocking

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
fun main() {
    // Load configuration - you can use different configs for different environments
    val config = CommunicationConfig.development() // Use development config with verbose settings
    
    println("Starting kdbQCanvas with dual-band communication...")
    println("Configuration: HTTP port ${config.httpPort}, WebSocket port ${config.websocketPort}")
    
    val qManager = QProcessManager(host = config.qProcessHost, port = config.qProcessPort)
    println("Starting Q process on ${config.getQProcessConnection()}...")
    qManager.start()

    // It's good to wait a moment for the process and IPC connection to establish
    try {
        Thread.sleep(2000) // Wait for 2 seconds
    } catch (_: InterruptedException) {
        Thread.currentThread().interrupt()
        println("Main thread interrupted. Exiting.")
        return
    }

    // Start the dual-band communication manager with configuration
    val communicationManager = DualBandCommunicationManager(qManager, config)
    communicationManager.start()

    // Demonstrate some queries via the existing interface (legacy support)
    attemptQueries(qManager)
    
    // Demonstrate new dual-band communication
    demonstrateDualBandCommunication(communicationManager)

    println("Press Enter to stop the servers...")
    readLine()

    println("Stopping communication manager...")
    communicationManager.stop()

    println("Stopping Q process...")
    qManager.stop()

    // Wait a moment for the process to fully stop
    try {
        Thread.sleep(500)
    } catch (_: InterruptedException) {
        Thread.currentThread().interrupt()
    }

    println("Is Q process running after stop? ${qManager.isRunning()}")
    println("Main function finished.")
}

private fun demonstrateDualBandCommunication(communicationManager: DualBandCommunicationManager) {
    println("\n=== Demonstrating Dual-Band Communication ===")
    
    runBlocking {
        try {
            // Test standard channel
            println("Testing standard channel...")
            val standardResult = communicationManager.executeQuery("1+1", ChannelType.STANDARD)
            println("Standard channel result: ${standardResult.data}")
            
            // Test fast channel
            println("Testing fast channel...")
            val fastResult = communicationManager.executeQuery("til 5", ChannelType.FAST)
            println("Fast channel result: ${formatData(fastResult.data)}")
            
            // Test automatic channel selection
            println("Testing automatic channel selection...")
            val autoChannel = communicationManager.selectOptimalChannel("mouseX+mouseY", isLiveMode = true)
            println("Automatic channel selection for live mode mouse query: $autoChannel")
            
            // Show connection status
            val connectionStatus = communicationManager.getConnectionStatus()
            println("Connection status:")
            connectionStatus.forEach { (channel, status) ->
                println("  $channel: ${if (status.isConnected) "Connected" else "Disconnected"} (${status.protocolType})")
            }
            
            // Show performance metrics
            val metrics = communicationManager.getMetrics()
            println("Performance metrics:")
            metrics.forEach { (channel, metric) ->
                println("  $channel: ${metric.totalRequests} requests, avg latency: ${metric.averageLatencyMs}ms")
            }
            
        } catch (e: Exception) {
            println("Error demonstrating dual-band communication: ${e.message}")
        }
    }
}

private fun attemptQueries(qManager: QProcessManager) {
    if (!qManager.isRunning()) {
        println("Q process is not running or not responsive, skipping queries.")
        return
    }

    val ipcConnector = qManager.getIPCConnector()
    if (ipcConnector == null) {
        println("IPC Connector is not available, skipping queries.")
        return
    }

    val queryLifecycleManager = QueryLifecycleManager(ipcConnector)

    // Example usage of QueryLifecycleManager
    val request1 = QueryRequest("1+1")
    val response1 = queryLifecycleManager.executeQuery(request1)
    printQueryResponse(response1, "Result of '1+1'")

    val request2 = QueryRequest("til 5")
    val response2 = queryLifecycleManager.executeQuery(request2)
    printQueryResponse(response2, "Result of 'til 5'")

    // Example of a query that might cause a KDB+ error
    val request3 = QueryRequest("'error") // This query will likely cause an error in Q
    val response3 = queryLifecycleManager.executeQuery(request3)
    printQueryResponse(response3, "Result of \'error'")

    // Example of a query on a non-existent table (if applicable to your Q setup)
    val request4 = QueryRequest("select from nonExistentTable")
    val response4 = queryLifecycleManager.executeQuery(request4)
    printQueryResponse(response4, "Result of 'select from nonExistentTable'")
}

private fun printQueryResponse(response: QueryResponse, description: String) {
    println("$description:")
    if (response.success) {
        println("  Data: ${formatData(response.data)} (Type: ${response.dataType})")
    } else {
        println("  Error: ${response.error} (Error Type: ${response.dataType})")
    }
}

private fun formatData(data: Any?): String {
    return when (data) {
        is LongArray -> data.joinToString()
        is IntArray -> data.joinToString()
        is DoubleArray -> data.joinToString()
        is ShortArray -> data.joinToString()
        is BooleanArray -> data.joinToString()
        is CharArray -> data.joinToString("")
        is Array<*> -> data.joinToString { it.toString() } // More generic array formatting
        null -> "null"
        else -> data.toString()
    }
}
