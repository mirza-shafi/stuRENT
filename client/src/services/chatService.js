/**
 * chatService.js — Client-side service for direct messaging API
 */

import api from './api'

const ChatService = {
  /** GET /api/v1/chat/conversations/ — Retrieve list of conversations */
  getConversations: () => api.get('/chat/conversations/'),

  /** GET /api/v1/chat/messages/?convo_id=... — Fetch thread messages */
  getMessages: (convoId) => api.get('/chat/messages/', { params: { convo_id: convoId } }),

  /** POST /api/v1/chat/messages/ — Send a message */
  sendMessage: (convoId, text) => api.post('/chat/messages/', { convo_id: convoId, text }),
}

export default ChatService
