<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <UButton 
              icon="i-lucide-arrow-left" 
              variant="ghost" 
              @click="navigateTo('/')"
            />
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <UIcon name="i-lucide-message-circle" class="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {{ roomId || 'Chat Room' }}
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
              @click="leaveRoom"
            >
              Leave
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Debug Info (hiển thị trong development) -->
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
        
        <!-- Chat Interface -->
        <UCard class="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h2 class="text-lg font-semibold">
                  Room: {{ roomId || 'Unknown' }}
                </h2>
              </div>
              <UBadge color="success" variant="soft">
                {{ messageData.length }} messages
              </UBadge>
            </div>
          </template>

          <!-- Messages Container -->
          <div class="h-96 overflow-y-auto space-y-3 mb-4 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg">
            <div v-if="messageData.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-message-square-dashed" class="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
            
            <div
              v-for="(msg, index) in messageData"
              :key="index"
              class="flex items-start space-x-3 animate-in slide-in-from-bottom duration-300"
              :class="msg.sender === userName ? 'flex-row-reverse space-x-reverse' : ''"
            >
              <UAvatar
                :alt="msg.sender"
                size="sm"
                :class="msg.sender === userName ? 'bg-blue-500' : 'bg-purple-500'"
              >
                {{ msg.sender?.charAt(0)?.toUpperCase() || 'U' }}
              </UAvatar>
              
              <div class="flex-1">
                <div
                  class="inline-flex flex-col max-w-xs lg:max-w-md px-4 py-2 rounded-2xl"
                  :class="msg.sender === userName 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm'"
                >
                  <div 
                    v-if="msg.sender !== userName"
                    class="flex items-center justify-between mb-1"
                  >
                    <span class="text-xs font-medium text-blue-600 dark:text-blue-400">{{ msg.sender || 'Unknown' }}</span>
                  </div>
                  <p class="text-sm break-words">{{ msg.content }}</p>
                  <span 
                    class="text-xs mt-1 opacity-70"
                    :class="msg.sender === userName ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'"
                  >
                    {{ formatTimestamp(msg.timestamp) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
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
const messageData = ref<ChatMessageDto[]>([]);
const isSending = ref(false);
const connectionStatus = ref('Connected');
const isClient = ref(false);

// Main data refs
const roomId = ref('');
const userName = ref('User');

// Debug computed values để hiển thị trong template
const roomIdFromRoute = computed(() => route.query.roomId as string || '');
const userNameFromRoute = computed(() => route.query.userName as string || '');
const roomIdFromURL = ref('');
const userNameFromURL = ref('');

// Hàm lấy URL params trực tiếp
function getURLParams() {
  if (import.meta.client) {
    const urlParams = new URLSearchParams(window.location.search);
    roomIdFromURL.value = urlParams.get('roomId') || '';
    userNameFromURL.value = urlParams.get('userName') || '';
  }
}

// Function để update values từ route hoặc localStorage
function updateValuesFromRoute() {
  console.log('Updating values from route query:', route.query);
  
  // Từ route query
  if (route.query.roomId) {
    roomId.value = route.query.roomId as string;
  }
  if (route.query.userName) {
    userName.value = route.query.userName as string;
  }
  
  // Fallback: từ localStorage nếu có
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

const { sendMessage } = useSocket();

function sendMessageFunction() {
  if (isEmpty(message.value)) {
    alert('Please enter a message.');
    return;
  }

  isSending.value = true;

  const newMessage: ChatMessageDto = {
    id: Date.now().toString(),
    sender: userName.value,
    content: message.value,
    timestamp: new Date().toISOString()
  };

  messageData.value.push(newMessage);
  sendMessage(roomId.value, newMessage);
  message.value = '';
  
  // Simulate sending delay
  setTimeout(() => {
    isSending.value = false;
  }, 500);
}

function leaveRoom() {
  if (confirm('Are you sure you want to leave this room?')) {
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