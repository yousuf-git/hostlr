import { io } from 'socket.io-client'

let socket = null
let currentToken = null

export const getSocket = (token) => {
  if (socket && currentToken !== token) {
    socket.disconnect()
    socket = null
  }
  if (!socket) {
    currentToken = token
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    socket = io(apiUrl, {
      auth: { token },
      autoConnect: true,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}
