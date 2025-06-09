import type { WebSocketMessage, ExecuteCodeMessage, ExecutionResultMessage, StatusMessage } from "@shared/schema";

export class QWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private onResultCallback?: (result: ExecutionResultMessage) => void;
  private onStatusCallback?: (status: StatusMessage) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("Connected to Q WebSocket server");
      this.reconnectAttempts = 0;
      this.onConnectedCallback?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case "result":
            this.onResultCallback?.(message as ExecutionResultMessage);
            break;
          case "status":
            this.onStatusCallback?.(message as StatusMessage);
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from Q WebSocket server");
      this.onDisconnectedCallback?.();
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  executeCode(code: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: ExecuteCodeMessage = {
        type: "execute",
        code
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  onResult(callback: (result: ExecutionResultMessage) => void) {
    this.onResultCallback = callback;
  }

  onStatus(callback: (status: StatusMessage) => void) {
    this.onStatusCallback = callback;
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
