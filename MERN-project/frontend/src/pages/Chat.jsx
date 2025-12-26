import React, { useState, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";
import AuthContext from "../context/AuthContext";
import { FaPaperPlane } from "react-icons/fa";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // -----------------------
  // INITIALIZE SOCKET
  // -----------------------
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });

    const roomId = `support-${user._id}`;
    socketRef.current.emit("join-room", roomId);

    // Receive message from server
    socketRef.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------
  // SEND MESSAGE
  // -----------------------
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      roomId: `support-${user._id}`,
      user: user.name,
      message: message,
      timestamp: Date.now(),
    };

    // Send to server (server will broadcast to all in room)
    socketRef.current.emit("send-message", msgData);

    // DO NOT ADD LOCALLY (avoids duplicates)
    // We wait for server broadcast instead

    setMessage("");
  };

  if (!user) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h2 className="mb-4 text-2xl font-bold">Please login to use chat support</h2>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Live Chat Support</h1>

      <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">

        {/* MESSAGES */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {messages.length === 0 ? (
            <div className="mt-6 text-center text-gray-500">
              Start a conversation with our support team
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.user === user.name ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.user === user.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="mb-1 text-sm font-semibold">{msg.user}</p>
                  <p>{msg.message}</p>

                  <p className="mt-1 text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* INPUT FIELD */}
        <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
            placeholder="Type your message..."
          />
          <button className="flex items-center gap-2 px-5 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            <FaPaperPlane /> Send
          </button>
        </form>

      </div>
    </div>
  );
};

export default Chat;
