import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import baseUrl from "../api/baseUrl";

const SocketClient = () => {
  // const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const username = jwtDecode(localStorage.getItem("access_token")).username;

    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server!");
      newSocket.emit("userConnected", username);
    });

    newSocket.on("message", (data) => {
      if (data.username && data.message) {
        setReceivedMessages((prevMessages) => [
          ...prevMessages,
          `${data.username}: ${data.message}`,
        ]);
      } else {
        setReceivedMessages((prevMessages) => [
          ...prevMessages,
          data.message || JSON.stringify(data),
        ]);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server!");
      newSocket.emit("userDisconnected", username);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && message.trim() !== "") {
      socket.emit("chatMessage", {
        username: username,
        message: message,
      });
      setMessage("");
    }
  };

  return (
    <div>
      <h1>React WebSocket Client</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      ---
      <h2>Received Messages:</h2>
      <ul>
        {receivedMessages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default SocketClient;
