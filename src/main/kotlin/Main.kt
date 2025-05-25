package org.example

import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.example.QIPC.QueryResponse
import org.example.api.QQueryApiServer

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
fun main() {
    val qManager = QProcessManager(host = "localhost", port = 5000)
    println("Starting Q process on port 5000...")
    qManager.start()

    // It's good to wait a moment for the process and IPC connection to establish
    try {
        Thread.sleep(2000) // Wait for 2 seconds
    } catch (_: InterruptedException) {
        Thread.currentThread().interrupt()
        println("Main thread interrupted. Exiting.")
        return
    }

    // Start the API server
    val apiServer = QQueryApiServer(qManager, 8080)
    apiServer.start()

    // Demonstrate some queries via the existing interface
    attemptQueries(qManager)

    println("Press Enter to stop the servers...")
    readLine()

    println("Stopping API server...")
    apiServer.stop()

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
