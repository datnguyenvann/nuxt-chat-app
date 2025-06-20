import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { ref, onUnmounted, onMounted } from "vue";
import type { ChatMessageDto } from "~/shared/model/ChatMessage.dto";

export function useSocket() {
  const socket = ref<Socket | null>(null);
  const messages = ref<ChatMessageDto[]>([]);
  const isConnected = ref(false);

  onMounted(() => {
    socket.value = io("http://localhost:5000");

    socket.value?.on('connect', () => {
      console.log('Connected to socket server');
      isConnected.value = true;
    });

    socket.value?.on('disconnect', () => {
      console.log('Disconnected from socket server');
      isConnected.value = false;
    });

    // Lắng nghe messages từ server
    socket.value?.on('chatMessage', ({sender, data}: {sender: string, data: ChatMessageDto}) => {
      console.log('Message received from user:', sender);
      console.log('Message received from server:', data);
      messages.value.push({
        id: data.id || Date.now().toString(),
        content: data.content,
        sender: data.sender,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    });

    // Lắng nghe room events
    socket.value?.on('userJoined', (data: { userName: string, roomId: string }) => {
      console.log('User joined:', data);
      // Có thể thêm system message
      messages.value.push({
        id: Date.now().toString(),
        content: `${data.userName} joined the room`,
        sender: 'System',
        timestamp: new Date().toISOString(),
      });
    });

    socket.value?.on('userLeft', (data: { userName: string, roomId: string }) => {
      console.log('User left:', data);
      // Có thể thêm system message
      messages.value.push({
        id: Date.now().toString(),
        content: `${data.userName} left the room`,
        sender: 'System',
        timestamp: new Date().toISOString(),
      });
    });
  });

  onUnmounted(() => {
    socket.value?.disconnect();
  });

  function joinRoom(roomId: string, userName?: string) {
    if (socket.value) {
      console.log('Joining room:', roomId, 'as:', userName);
      socket.value.emit("joinRoom", { roomId, userName });
    }
  }

  function leaveRoom(roomId: string, userName?: string) {
    if (socket.value) {
      console.log('Leaving room:', roomId);
      socket.value.emit("leaveRoom", { roomId, userName });
    }
  }

  function sendMessage(roomId: string, messageData: ChatMessageDto) {
    if (socket.value && isConnected.value) {
      console.log('Sending message:', messageData);
      socket.value.emit("messageToServer", { roomId, messageData });
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }

  // Clear messages (useful when switching rooms)
  function clearMessages() {
    messages.value = [];
  }

  return {
    socket,
    messages,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    clearMessages
  };
}
