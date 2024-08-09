import "./index.css"; // Import Tailwind CSS
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

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
        <Chat socket={socket} username={username} room={room} leaveRoom={leaveRoom} />
      )}
    </div>
  );
}

export default App;


