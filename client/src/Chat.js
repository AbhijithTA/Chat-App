import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from 'emoji-picker-react';
import "./index.css"; // Import Tailwind CSS


function Chat({ socket, username, room, leaveRoom }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setIsTyping(false); // Stop typing when message is sent
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("user_joined", (data) => {
      const joinMessage = {
        room: data.room,
        author: "System",
        message: data.message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      setMessageList((list) => [...list, joinMessage]);
    });

    socket.on("user_left", (data) => {
      const leaveMessage = {
        room: data.room,
        author: "System",
        message: data.message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      setMessageList((list) => [...list, leaveMessage]);
    });

    // Listen for typing and stop typing events
    socket.on("typing", (data) => {
      if (!typingUsers.includes(data.username)) {
        setTypingUsers((prev) => [...prev, data.username]);
      }
    });

    socket.on("stop_typing", (data) => {
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket, typingUsers]);

  useEffect(() => {
    if (isTyping) {
      socket.emit("typing", {
        room: room,
        username: username,
      });
    } else {
      socket.emit("stop_typing", {
        room: room,
        username: username,
      });
    }
  }, [isTyping, room, username]);

  const handleInputChange = (event) => {
    setCurrentMessage(event.target.value);
    setIsTyping(event.target.value.length > 0);
  };

  const onEmojiClick = (emojiObject) => {
    setCurrentMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  

  return (
    <div className="flex flex-col h-[50rem]">
      <div className="p-4 bg-blue-500 text-white text-center">
        <p className="text-lg">Live Chat</p>
      </div>
      <div className="flex-1 p-4 overflow-auto bg-gray-800">
        <ScrollToBottom className="h-full">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className={`mb-4 p-2 rounded-lg ${
                  username === messageContent.author
                    ? "bg-blue-500 text-white self-end"
                    : "bg-white border"
                }`}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta text-xs text-right">
                    <p>{messageContent.time}</p>
                    <p>{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div id="typingIndicator">
            {typingUsers.length > 0 && (
              <p className="text-gray-400">
                {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
              </p>
            )}
          </div>
        </ScrollToBottom>
      </div>
      <div className="p-4 bg-blue-400 border-t flex items-center relative">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          className="flex-grow p-2 border rounded"
          onChange={handleInputChange}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
          id="message-input"
        />
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="ml-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-700"
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-16">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          &#9658;
        </button>
        <button
          onClick={leaveRoom}
          className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default Chat;
