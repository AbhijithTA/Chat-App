import React, { useState, useEffect } from "react";
import "./index.css"; // Import Tailwind CSS
import io from "socket.io-client";
import Chat from "./components/Chat";
import ParticipantsList from "./components/RoomParticipants";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [participants, setParticipants] = useState([]); // State to hold all members
  const [activeUsers, setActiveUsers] = useState([]); // State to hold only active members

  useEffect(() => {
    if (showChat) {
      socket.on("user_online", (data) => {
        setParticipants((prevParticipants) => {
          if (!prevParticipants.includes(data.username)) {
            return [...prevParticipants, data.username];
          }
          return prevParticipants;
        });

        setActiveUsers((prevActiveUsers) => {
          if (!prevActiveUsers.includes(data.username)) {
            return [...prevActiveUsers, data.username];
          }
          return prevActiveUsers;
        });
      });

      socket.on("user_offline", (data) => {
        setActiveUsers((prevActiveUsers) =>
          prevActiveUsers.filter((user) => user !== data.username)
        );
      });

      socket.on("online_users", (users) => {
        setParticipants(users);
        setActiveUsers(users);
      });

      return () => {
        socket.off("user_online");
        socket.off("user_offline");
        socket.off("online_users");
      };
    }
  }, [showChat]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { room, username });
    setShowChat(false);
    setRoom("");
    setUsername("");
    setParticipants([]); 
    setActiveUsers([]);  
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {!showChat ? (
        <div className="p-10 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl mb-4">Join A Chat</h3>
          <input
            type="text"
            placeholder="Enter your name..."
            className="block w-full p-2 mb-4 border rounded"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            className="block w-full p-2 mb-4 border rounded"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button
            onClick={joinRoom}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Join A Room
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Chat socket={socket} username={username} room={room} leaveRoom={leaveRoom} />
          <ParticipantsList participants={participants} currentUser={username} activeUsers={activeUsers} /> {/* Pass activeUsers */}
        </div>
      )}
    </div>
  );
}

export default App;
