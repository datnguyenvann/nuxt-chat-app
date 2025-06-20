<template>
  <div class="">
    <div class="">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <UButton 
              icon="i-lucide-arrow-left" 
              variant="ghost" 
              @click="navigateTo('/')"
            />
            <div class="flex items-center space-x-3">
              <div>
                <h1 class="">
                  Room name: {{ roomId || 'Chat Room' }}
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ userName }} • {{ connectionStatus }}</p>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <UColorModeButton />
            <UButton
              icon="i-lucide-log-out"
              variant="outline"
              color="error"
              @click="leaveRoomFunction"
            >
              Leave
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <UCard class="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <template #header>
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Debug Info</h3>
          </template>
          <div class="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
            <div><strong>Route Query:</strong> {{ JSON.stringify(route.query) }}</div>
            <div><strong>Route Computed:</strong> roomId: {{ roomIdFromRoute }}, userName: {{ userNameFromRoute }}</div>
            <div><strong>URL Params:</strong> roomId: {{ roomIdFromURL }}, userName: {{ userNameFromURL }}</div>
            <div><strong>Final Values:</strong> roomId: {{ roomId }}, userName: {{ userName }}</div>
            <div><strong>Is Client:</strong> {{ isClient }}</div>
          </div>
        </UCard>
        
        <br>

        <UCard class="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <UBadge color="success" variant="soft">
                {{ messageData.length }} messages
              </UBadge>
            </div>
          </template>
          <div class="h-96 overflow-y-auto space-y-3 mb-4 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg">
            <div v-if="messageData.length === 0" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
            
            <br>

            <div
              v-for="(msg, index) in messageData"
              :key="index"
              class=""
              :class="msg.sender === userName ? 'flex-row-reverse space-x-reverse' : ''"
            >
              <div class="" style="padding: 5px;">
                <div class="row" style="display: flex; justify-content: flex-end;">
                  <div class="col-10" style="display: grid;">
                    <span>{{ msg.content }}</span>
                    <span style="font-size: 12px; color: gray;">{{ formatTimestamp(msg.timestamp) }}</span>
                  </div>

                  <div class="col-2 text-right" style="display: flex; align-items: center; padding-left: 10px;">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ msg.sender }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex space-x-2">
              <div class="flex-1">
                <UInput
                  v-model="message"
                  placeholder="Type your message here..."
                  size="lg"
                  @keyup.enter="sendMessageFunction"
                >
                  <template #leading>
                    <UIcon name="i-lucide-message-circle" class="h-4 w-4" />
                  </template>
                </UInput>
              </div>
              <UButton
                :disabled="!message.trim()"
                size="lg"
                icon="i-lucide-send"
                :loading="isSending"
                @click="sendMessageFunction"
              >
                Send
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSocket } from '~/composables/useSocket';
import { isEmpty } from '~/shared/helper/common.helper';
import type { ChatMessageDto } from '~/shared/model/ChatMessage.dto';

const route = useRoute();
const message = ref('');
const isSending = ref(false);
const isClient = ref(false);

const roomId = ref('');
const userName = ref('User');

const roomIdFromRoute = computed(() => route.query.roomId as string || '');
const userNameFromRoute = computed(() => route.query.userName as string || '');
const roomIdFromURL = ref('');
const userNameFromURL = ref('');

// Sử dụng socket và lấy messages từ đó
const { messages, isConnected, joinRoom, leaveRoom: socketLeaveRoom, sendMessage, clearMessages } = useSocket();

// Connection status computed from socket
const connectionStatus = computed(() => isConnected.value ? 'Connected' : 'Disconnected');

// Sử dụng messages từ socket thay vì local messageData
const messageData = computed(() => messages.value);

function getURLParams() {
  if (import.meta.client) {
    const urlParams = new URLSearchParams(window.location.search);
    roomIdFromURL.value = urlParams.get('roomId') || '';
    userNameFromURL.value = urlParams.get('userName') || '';
  }
}

function updateValuesFromRoute() {
  console.log('Updating values from route query:', route.query);

  if (route.query.roomId) {
    roomId.value = route.query.roomId as string;
  }
  if (route.query.userName) {
    userName.value = route.query.userName as string;
  }
  
  if (import.meta.client && (!roomId.value || !userName.value)) {
    try {
      const saved = localStorage.getItem('chatRoom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!roomId.value && parsed.roomId) roomId.value = parsed.roomId;
        if (!userName.value && parsed.userName) userName.value = parsed.userName;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage:', e);
    }
  }
  
  console.log('Final values:', { roomId: roomId.value, userName: userName.value });
}

// Watch route changes
watch(() => route.query, () => {
  updateValuesFromRoute();
}, { immediate: true, deep: true });

// Watch for room changes and join room via socket
watch([roomId, userName], ([newRoomId, newUserName]) => {
  if (newRoomId && newUserName && isConnected.value) {
    console.log('Joining room via socket:', newRoomId, 'as:', newUserName);
    clearMessages(); // Clear previous messages when switching rooms
    joinRoom(newRoomId, newUserName);
  }
}, { immediate: false });

// Join room when socket connects and we have room info
watch(isConnected, (connected) => {
  if (connected && roomId.value && userName.value) {
    console.log('Socket connected, joining room:', roomId.value);
    joinRoom(roomId.value, userName.value);
  }
});

function sendMessageFunction() {
  if (isEmpty(message.value)) {
    alert('Please enter a message.');
    return;
  }

  if (!isConnected.value) {
    alert('Not connected to server. Please wait and try again.');
    return;
  }

  isSending.value = true;

  const newMessage: ChatMessageDto = {
    id: Date.now().toString(),
    sender: userName.value,
    content: message.value,
    timestamp: new Date().toISOString()
  };

  // Gửi message qua socket, không push local nữa vì socket sẽ broadcast lại
  sendMessage(roomId.value, newMessage);
  message.value = '';
  
  // Simulate sending delay
  setTimeout(() => {
    isSending.value = false;
  }, 500);
}

function leaveRoomFunction() {
  if (confirm('Are you sure you want to leave this room?')) {
    if (roomId.value && userName.value) {
      socketLeaveRoom(roomId.value, userName.value);
    }
    navigateTo('/');
  }
}

function formatTimestamp(timestamp: string) {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return timestamp;
  }
}

// Client-side check
onMounted(() => {
  isClient.value = true;
  getURLParams();
  updateValuesFromRoute();
  
  // Validation và redirect nếu không có roomId
  nextTick(() => {
    console.log('Final values - roomId:', roomId.value, 'userName:', userName.value);
    
    if (isEmpty(roomId.value)) {
      console.warn('Room ID is missing, redirecting to home');
      alert('Room ID is required to join a chat room.');
      navigateTo('/');
    } else {
      console.log('Successfully loaded room:', roomId.value, 'for user:', userName.value);
    }
  });
});

// SEO Meta - sử dụng computed để update động
watchEffect(() => {
  useHead({
    title: `Chat Room: ${roomId.value || 'Unknown'} - Chat App`,
    meta: [
      {
        name: 'description',
        content: `Chatting in room ${roomId.value || 'Unknown'} as ${userName.value}`
      }
    ]
  });
});
</script>

<style></style>