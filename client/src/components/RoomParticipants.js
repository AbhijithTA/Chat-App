import React from "react";

const ParticipantsList = ({ participants, currentUser, activeUsers }) => {
  return (
    <div className="participants-list p-4 bg-white rounded-lg shadow-md w-64">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Members in the Room</h3>
      <ul className="space-y-3">
        {participants.map((participant, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-lg hover:bg-blue-50"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {participant.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-800 font-medium">
                {participant} {participant === currentUser && "(You)"}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${activeUsers.includes(participant) ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsList;
