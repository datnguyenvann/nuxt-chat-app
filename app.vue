<template>
  <div>
    <h1>Chat App</h1>
    <div>
      <span>Room ID:</span>
      <input v-model="roomId" type="text" placeholder="Enter room ID..." />
      <button
        :disabled="isEmpty(roomId) ? true : false"
        class="btn btn-primary"
        @click="joinRoom"
      >
        Join Room
      </button>
    </div>

    <div>
      <input v-model="message" type="text" placeholder="Type your message here..." />
      <button
        :disabled="!isEmpty(roomId) ? false : true"
        class="btn btn-primary"
        @click="sendMessage"
      >
        Send
      </button>
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

<script lang="ts" setup>
import { ref } from 'vue'
import type { ChatMessageDto } from './shared/model/ChatMessage.dto'
import moment from 'moment'
import { io } from 'socket.io-client'
import { isEmpty } from './shared/helper/common.helper'

const message = ref('')
const messageData = ref<ChatMessageDto[]>([])
let socket: ReturnType<typeof io> | null = null
const roomId = ref<string>()

function sendMessage() {
  if (!socket) {
    return
  }
  console.log('Message sent:', message.value)
  const newMessage: ChatMessageDto = {
    id: moment().format('DDMMYYYYHHmmss'),
    content: message.value,
    sender: 'User',
    timestamp: moment().format('DD/MM/YYYY HH:mm'),
  }
  messageData.value.push(newMessage)
  socket.emit('messageToServer', { roomId: roomId.value, message: message.value })
  message.value = ''
}

function initSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io('http://localhost:5000')
  setupEventListeners()
}

function joinRoom() {
  if (!socket || isEmpty(roomId.value)) {
    return
  }
  console.log('Joining room:', roomId.value)
  socket.emit('joinRoom', { roomId: roomId.value })

  messageData.value = []
}

function setupEventListeners() {
  if (!socket) return

  socket.on('connect', () => {
    console.log('Connected to WebSocket server')
  })

  socket.on('disconnect', (reason: unknown) => {
    console.log('Disconnected from server:', reason)
  })

  socket.on('connect_error', (error: unknown) => {
    console.error('Connection error:', error)
  })

  socket.on('reconnect', (attemptNumber: unknown) => {
    console.log('Reconnected after', attemptNumber, 'attempts')
  })

  socket.on('reconnect_attempt', (attemptNumber: unknown) => {
    console.log('Reconnecting... attempt', attemptNumber)
  })

  socket.on('reconnect_failed', () => {
    console.log('Failed to reconnect')
  })

  socket.on('chatMessage', (msg: string) => {
    console.log('Message from server:', msg)
    messageData.value.push({
      id: '',
      content: msg,
      sender: 'SERVER',
      timestamp: moment().format('DD/MM/YYYY HH:mm'),
    })
  })

  socket.on('error', (error: unknown) => {
    console.error('Socket error:', error)
  })
}

onMounted(() => {
  initSocket()
})
</script>
