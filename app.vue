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

export default {
  setup() {
    const message = ref('');
    const messageData = ref<ChatMessageDto[]>([]);

    const sendMessage = () => {
      console.log('Message sent:', message.value);
      const newMessage: ChatMessageDto = {
        id: moment().format('DDMMYYYYHHmmss'),
        content: message.value,
        sender: 'User',
        timestamp: moment().format('DD/MM/YYYY HH:mm'),
      };
      messageData.value.push(newMessage);
      message.value = '';
    };

    return {
      message,
      sendMessage,
      messageData,
    };
  },
};
</script>
