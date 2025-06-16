<template>
  <div>
    <h1>Chat App</h1>
    <div>
      <input v-model="message" type="text" placeholder="Type your message here..." />
      <button @click="sendMessage">Send</button>
    </div>

    <div>
      <h2>Messages</h2>
      <ul>
        <div v-for="(msg, index) in messageData" :key="index">
          <strong>{{ msg.sender }}:</strong> {{ msg.content }} <em>({{ msg.timestamp }})</em>
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import type { ChatMessageDto } from './shared/model/ChatMessage.dto';
import moment from 'moment';
import { io } from 'socket.io-client';

export default {
  setup() {
    const message = ref('');
    const messageData = ref<ChatMessageDto[]>([]);
    let socket: ReturnType<typeof io> | null = null;

    function sendMessage() {
      if (!socket) {
        return;
      }
      console.log('Message sent:', message.value);
      const newMessage: ChatMessageDto = {
        id: moment().format('DDMMYYYYHHmmss'),
        content: message.value,
        sender: 'User',
        timestamp: moment().format('DD/MM/YYYY HH:mm'),
      };
      messageData.value.push(newMessage);
      socket.emit('joinRoom', { roomId: 'room1' });
      socket.emit('messageToServer', { roomId: 'room1', message: message.value });
      message.value = '';
    }

    function initSocket() {
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      socket = io('http://localhost:5000');
      setupEventListeners();
    };

    function setupEventListeners() {
      if (!socket) return;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', (reason: unknown) => {
        console.log('Disconnected from server:', reason);
      });

      socket.on('connect_error', (error: unknown) => {
        console.error('Connection error:', error);
      });

      socket.on('reconnect', (attemptNumber: unknown) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
      });

      socket.on('reconnect_attempt', (attemptNumber: unknown) => {
        console.log('Reconnecting... attempt', attemptNumber);
      });

      socket.on('reconnect_failed', () => {
        console.log('Failed to reconnect');
      });

      socket.on('chatMessage', (msg: string) => {
        console.log('Message from server:', msg);
        messageData.value.push({
          id: '',
          content: msg,
          sender: 'SERVER',
          timestamp: moment().format('DD/MM/YYYY HH:mm'),
        });
      });

      socket.on('error', (error: unknown) => {
        console.error('Socket error:', error);
      });
    }

    onMounted(() => {
      initSocket();
    });

    return {
      message,
      sendMessage,
      messageData,
      initSocket,
    };
  },
};
</script>
