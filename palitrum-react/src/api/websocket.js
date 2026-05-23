import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {
  const token = localStorage.getItem("accessToken");
  const client = new Client({
    webSocketFactory: () => new SockJS(`http://localhost:8080/ws?accessToken=${token}`),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe("/topic/applications", (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    },
  });
  client.activate();
  stompClient = client;
  return client;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};