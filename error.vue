<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
    <div class="text-center max-w-md mx-auto px-4">
      <div class="mb-8">
        <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="space-y-4">
        <UButton
          size="lg"
          icon="i-lucide-home"
          @click="navigateTo('/')"
        >
          Go Home
        </UButton>
        
        <div class="flex justify-center space-x-4">
          <UButton
            variant="outline"
            icon="i-lucide-log-in"
            @click="navigateTo('/join-room')"
          >
            Join Room
          </UButton>
          
          <UButton
            variant="outline"
            icon="i-lucide-message-circle"
            @click="navigateTo('/chat-room')"
          >
            Chat Room
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: '404 - Page Not Found - Chat App',
  meta: [
    {
      name: 'description',
      content: 'The page you are looking for could not be found.'
    }
  ]
})
</script>
