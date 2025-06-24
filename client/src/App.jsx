import { useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { useEffect } from "react";

const socket = io("http://localhost:3000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("welcome", (msg) => {
      setMessages((prevMessages) => {
        return [...prevMessages, `Server: ${msg}`];
      });
    });

    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => {
        return [...prevMessages, `You: ${msg}`];
      });
    });
  }, []);

  const sendMessage = () => {
    e.preventDefault();

    if (message.trim()) {
      socket.emit("chat message", message);
      setMessage("");
    }
  };

  return (
    <div>
      <h1>Socket.IO React Client</h1>
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message chat..."
          className="border"
        />
        <button type="submit" disabled={!isConnected} className="border">
          Send
        </button>
      </form>

      <div className="messages-container">
        <h2>Received Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
