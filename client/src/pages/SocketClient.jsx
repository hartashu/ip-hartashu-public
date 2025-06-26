import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import baseUrl from "../api/baseUrl";
import showToast from "../utils/toast";
import axios from "axios";
import Toastify from "toastify-js";
import { fetchChat, addMessage } from "../features/chatSlice";

import { useSelector, useDispatch } from "react-redux";

const getAvatarUrl = (usernameOrSvgString) => {
  // if (
  //   usernameOrSvgString &&
  //   typeof usernameOrSvgString === "string" &&
  //   usernameOrSvgString.startsWith("<svg")
  // ) {
  //   // If it's an SVG string, convert it to a Data URL
  //   const encodedSvg = encodeURIComponent(usernameOrSvgString)
  //     .replace(/'/g, "%27")
  //     .replace(/"/g, "%22");
  //   return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
  // }

  if (!usernameOrSvgString) {
    console.log("QWERQWERWRQWRQR", usernameOrSvgString);
    return "https://api.dicebear.com/7.x/miniavs/svg?seed=programmer";
  }

  return `https://api.dicebear.com/7.x/miniavs/svg?seed=${encodeURIComponent(
    usernameOrSvgString
  )}`;
};

const SocketClient = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [message, setMessage] = useState("");
  // const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [summary, setSummary] = useState("");
  const messagesEndRef = useRef(null);

  const { chat: receivedMessages } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const fetchAvatarAndUpdatePhoto = async () => {
    try {
      const response = await axios.get(
        `https://api.dicebear.com/7.x/miniavs/svg?seed=${encodeURIComponent(
          username
        )}`,
        {
          responseType: "text",
        }
      );

      const { data } = await axios.patch(
        `${baseUrl}/users/${userId}`,
        {
          imgUrl: response.data,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
    } catch (error) {
      console.log("Avatar error:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // setReceivedMessages(data.message);
      // console.log(data.message);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showToast("Failed to fetch messages", "error");
    }
  };

  useEffect(() => {
    // fetchMessages();
    fetchAvatarAndUpdatePhoto();
  }, [userId, username]);

  useEffect(() => {
    dispatch(fetchChat());
  }, [dispatch, username, userId]);

  useEffect(() => {
    setUserId(jwtDecode(localStorage.getItem("access_token")).id);
    setUsername(jwtDecode(localStorage.getItem("access_token")).username);
    setImgUrl(jwtDecode(localStorage.getItem("access_token")).imgUrl);

    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("userConnected", username);
    });

    newSocket.on("message", (data) => {
      if (data.username && data.message) {
        // setReceivedMessages((prevMessages) => [...prevMessages, data]);
        dispatch(addMessage(data));
      } else {
        // setReceivedMessages((prevMessages) => [
        //   ...prevMessages,
        //   {
        //     username: "System",
        //     message: data.message,
        //   },
        // ]);

        dispatch(
          addMessage({
            username: "System",
            message: data.message,
          })
        );
      }
    });

    newSocket.on("summaryBroadcast", (data) => {
      console.log(data);
      dispatch(addMessage(data));
    });

    newSocket.on("disconnect", () => {
      newSocket.emit("userDisconnected", username);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [username, userId, dispatch, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [receivedMessages]);

  // useEffect(() => {
  //   console.log(receivedMessages);
  // }, [receivedMessages]);

  const sendMessage = async () => {
    try {
      if (socket && message.trim() !== "") {
        socket.emit("chatMessage", {
          userId: userId,
          username: jwtDecode(localStorage.getItem("access_token")).username,
          message: message.trim(),
        });

        /*
        const { data } = await axios.post(
          `${baseUrl}/messages`,
          {
            userId: userId,
            message: message.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        */

        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    }
  };

  const handleSummarizeClick = async () => {
    try {
      setIsLoading(true);

      const { data } = await axios.get(`${baseUrl}/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setSummary(data.message);

      await axios.patch(
        `${baseUrl}/messages`,
        {
          isSummarized: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      /*
      Toastify({
        text: data.message,
        duration: 100000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #4CAF50, #8BC34A)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          padding: "12px 20px",
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          fontWeight: "600",
        },
        offset: {
          x: 20,
          y: 20,
        },
      }).showToast();
      */

      setIsLoading(false);

      showToast("Messages summarized successfully", "success");
    } catch (error) {
      console.error("Error summarizing messages:", error);
      showToast("Failed to summarize messages", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // useEffect(() => {
  //   if (summary) {
  //     showToast(`Summary: ${summary}`, "info");
  //     setSummary(""); // Clear summary after showing it
  //   }
  // }, [summary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="fixed top-4 right-4 z-50">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg cursor-pointer text-xs"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] border border-gray-200">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-md text-white rounded-t-xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              CogniChat
            </h1>
            <p className="text-sm opacity-90 mt-1">
              Logged in as:
              <span className="font-bold underline ml-2">{username}</span>
            </p>
          </div>

          {jwtDecode(localStorage.getItem("access_token")).role === "admin" && (
            <button
              onClick={handleSummarizeClick}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              {isLoading ? "Summarizing..." : "Summarize (by AI)"}
            </button>
          )}
        </div>

        {/* Messages Display Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {receivedMessages.length === 0 ? (
            <p className="text-center text-gray-500 italic mt-10">
              Start chatting! Your messages will appear here.
            </p>
          ) : (
            receivedMessages?.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 mb-4 ${
                  msg.username === username ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar for other users' messages on the left */}
                {msg.username !== username && (
                  <img
                    src={
                      // msg?.imgUrl ||
                      getAvatarUrl(msg?.username)
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div // This div wraps the username and message bubble
                  className={`max-w-[70%] flex flex-col ${
                    // Corrected max-w and removed bg-blue-200 from here
                    msg.username === username ? "items-end" : "items-start"
                  }`}
                >
                  {/* Display sender's username above the message for other users */}
                  {msg.username === username ? (
                    <p className="font-semibold text-xs text-gray-700 mb-0.5 ml-1">
                      You
                    </p>
                  ) : (
                    <p className="font-semibold text-xs text-gray-700 mb-0.5 ml-1">
                      {msg.username}
                    </p>
                  )}
                  <div // This is the actual message bubble div
                    className={`w-full px-4 py-2 rounded-xl shadow-sm text-sm break-words ${
                      // Added break-words
                      msg.username === username
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
                {/* Avatar for current user's messages on the right */}
                {msg?.username === username && (
                  <img
                    src={
                      // msg?.imgUrl ||
                      getAvatarUrl(msg?.username)
                    }
                    alt={`${msg.username}'s avatar`}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
              </div>
            ))
          )}
          {/* Empty div for scrolling to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress} // Handle Enter key press
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim()} // Disable button if message is empty
          >
            Send
          </button>
        </div>
      </div>

      {/* Custom scrollbar style (Tailwind doesn't offer direct scrollbar styling, so this is a common workaround) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a8a8a8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888;
        }
      `}</style>
    </div>
  );
};

export default SocketClient;
