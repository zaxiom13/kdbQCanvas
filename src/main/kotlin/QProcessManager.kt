package org.example

import org.example.QIPC.IPCConnector
import org.example.QIPC.QIPCConnector

class QProcessManager(private val host: String = "localhost", private val port: Int = 5000) {
    private var process: Process? = null
    private var ipcConnector: QIPCConnector? = null

    fun start() {
        if (process == null || process?.isAlive == false) {
            val pb = ProcessBuilder("/home/zakaria/q/l64/q", "-p", port.toString())
            pb.redirectErrorStream(true)
            try {
                process = pb.start()
                println("Q process started.")
                // Wait a bit for q process to initialize before connecting
                Thread.sleep(1000) // Adjust as needed
                ipcConnector = QIPCConnector(host, port)
                ipcConnector?.connect() // Establish connection using the new connector
            } catch (e: Exception) { // Catch generic Exception for process start & initial connect
                println("Error starting Q process or connecting via IPC: ${e.message}")
                process?.destroyForcibly()
                process = null
                ipcConnector?.disconnect()
                ipcConnector = null
            }
        }
    }

    fun stop() {
        ipcConnector?.disconnect()
        ipcConnector = null

        process?.destroy()
        try {
            val exited = process?.waitFor(500, java.util.concurrent.TimeUnit.MILLISECONDS)
            if (exited == false) {
                process?.destroyForcibly()
                println("Q process forcibly stopped.")
            }
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            process?.destroyForcibly()
            println("Q process forcibly stopped due to interruption.")
        }
        process = null
        println("Q process stopped.")
    }

    fun isRunning(): Boolean {
        // Check IPC connection status via the connector
        return ipcConnector?.ping() == true
    }

    // Provide access to the IPC connector - returns the interface type instead of the concrete implementation
    fun getIPCConnector(): IPCConnector? {
        return ipcConnector
    }
}

