import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getConfig } from "../config/config";

let stompClient;

export const connectWebSocket = (onMessage) => {
    const socket = new SockJS(`${getConfig().apiUrl}/ws`);

    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: () => {}
    });

    stompClient.onConnect = () => {
        stompClient.subscribe("/topic/transactions", (message) => {
            const body = JSON.parse(message.body);
            onMessage(body);
        });
    };

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};