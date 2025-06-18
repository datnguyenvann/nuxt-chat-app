<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chat App
              </h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">Real-time messaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto text-center space-y-8">
        <div class="grid md:grid-cols-2 gap-6 mt-12">
          <UCard class="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 class="text-xl font-semibold mb-2">Start Chatting</h3>
            <div class="text-center p-6" @click="navigateTo('/join-room')">
              <UButton color="success" size="lg" block>
                Join room
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO và Meta tags
useHead({
  title: 'Chat App - Real-time Messaging',
  meta: [
    {
      name: 'description',
      content: 'Connect and chat with friends, family, and colleagues in real-time with our modern chat application.'
    }
  ]
})
</script>
