import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { ref, onUnmounted, onMounted } from "vue";

export function useSocket() {
  const socket = ref<Socket | null>(null);

  onMounted(() => {
    socket.value = io("http://localhost:5000");
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  function joinRoom(roomId: string) {
    if (socket.value) {
      socket.value.emit("joinRoom", { roomId });
    }
  }

  function leaveRoom(roomId: string) {
    if (socket.value) {
      socket.value.emit("leaveRoom", { roomId });
    }
  }

  function sendMessage(roomId: string, messageData: unknown) {
    if (socket.value) {
      socket.value.emit("sendMessage", { roomId, messageData: messageData });
    }
  }

  return {
    socket,
    joinRoom,
    leaveRoom,
    sendMessage
  };
}
