import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  console.error("VITE_SOCKET_URL is not defined in .env! Backend connection will fail.");
}

// We create a single socket instance for the entire application.
export const socket = io(SOCKET_URL || "", {
  autoConnect: true,
});
