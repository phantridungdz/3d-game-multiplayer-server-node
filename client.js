const io = require("socket.io-client");

// Kết nối đến máy chủ Socket.io
const socket = io("http://103.74.104.156:4000");

// Bắt sự kiện khi kết nối thành công
socket.on("connect", () => {
  console.log("Connected to server");
});

// Bắt sự kiện "message" từ máy chủ
socket.on("message", (data) => {
  console.log("Received message from server:", data);
});

// Gửi tin nhắn đến máy chủ
socket.emit("player connect", { message: "Hello from the client" });
