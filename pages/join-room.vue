<template>
  <div>
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Join Room
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">Enter room details to join</p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-md mx-auto">
        
        <!-- Join Room Form -->
        <UCard class="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <template #header>
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-users" class="h-5 w-5 text-blue-500" />
              <h2 class="text-lg font-semibold">Room Information</h2>
            </div>
          </template>

          <div class="space-y-6">
            <UFormGroup label="Room ID *" required>
              <UInput 
                v-model="roomId" 
                placeholder="Enter room ID..." 
                icon="i-lucide-hash"
                size="lg"
                :color="roomId ? 'success' : 'neutral'"
              />
              <template #help>
                <span class="text-xs text-gray-500">
                  Ask the room owner for the room ID
                </span>
              </template>
            </UFormGroup>

            <UFormGroup label="Your Name">
              <UInput 
                v-model="userName" 
                placeholder="Enter your name..." 
                icon="i-lucide-user"
                size="lg"
              />
              <template #help>
                <span class="text-xs text-gray-500">
                  This name will be shown to other users
                </span>
              </template>
            </UFormGroup>
          </div>

          <template #footer>
            <div class="flex flex-col space-y-3">
              <UButton
                :disabled="isEmpty(roomId)"
                size="lg"
                icon="i-lucide-log-in"
                :loading="isJoining"
                block
                @click="joinRoomFunction"
              >
                Join Room
              </UButton>
              
              <UButton
                variant="outline"
                size="lg"
                icon="i-lucide-arrow-left"
                block
                @click="navigateTo('/')"
              >
                Back to Home
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { isEmpty } from '~/shared/helper/common.helper';
import { useSocket } from '~/composables/useSocket';

const roomId = ref<string>('');
const userName = ref<string>('User');
const isJoining = ref(false);

const { joinRoom } = useSocket();

async function joinRoomFunction() {
  if (isEmpty(roomId.value)) {
    alert('Please enter a valid room ID.');
    return;
  }

  isJoining.value = true;
  
  try {
    joinRoom(roomId.value);

    // Lưu vào localStorage để backup
    if (import.meta.client) {
      localStorage.setItem('chatRoom', JSON.stringify({
        roomId: roomId.value,
        userName: userName.value || 'User'
      }));
    }

    // Sử dụng await để đảm bảo navigation hoàn thành
    await navigateTo({
      path: '/chat-room',
      query: {
        roomId: roomId.value,
        userName: userName.value || 'User',
      },
    });
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    isJoining.value = false;
  }
}

useHead({
  title: 'Join Room - Chat App',
  meta: [
    {
      name: 'description',
      content: 'Join a chat room and start connecting with others in real-time.'
    }
  ]
})
</script>

<style></style>