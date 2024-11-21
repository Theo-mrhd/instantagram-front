import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [currentReceiverId, setCurrentReceiverId] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchDiscussions();
    }
  }, [navigate]);

  useEffect(() => {
    if (currentReceiverId) {
      fetchMessages(currentReceiverId);

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      const token = localStorage.getItem("token");
      const newSocket = io("http://localhost:2999", {
        auth: {
          token,
        },
      });
      socketRef.current = newSocket;

      newSocket.emit("join", currentReceiverId);

      setMessages([]);

      newSocket.on("message", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentReceiverId]);

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/messages/discussion"
      );
      setDiscussions(response.data.users);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      const msg = {
        senderId: localStorage.getItem("userId"),
        receiverId: currentReceiverId,
        content: message,
      };
      socketRef.current.emit("message", msg);
      setMessage("");
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="flex w-full h-[93%]">
        <div className="w-4/5 h-full">
          <p className="p-4 text-xl font-semibold">Messages</p>
          <div className="flex flex-col gap-2 p-4">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-center justify-between">
                <p>{msg.content}</p>
                <p className="text-xs">
                  {format(new Date(msg.timestamp), "HH:mm dd/MM/yyyy")}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/5 h-full bg-gray-100">
          <p className="p-4 text-xl font-semibold">Discussions</p>
          <ul className="flex flex-col gap-2 px-4 [&_li]:cursor-pointer">
            {discussions.map((user) => (
              <li
                key={user.id}
                onClick={() => setCurrentReceiverId(user.id)}
                className={
                  currentReceiverId === user.id
                    ? "text-[#1C64FE] font-medium"
                    : ""
                }
              >
                {user.firstname}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full h-[7%] flex items-center justify-between">
        <textarea
          id="message"
          className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none bg-gray-50"
          placeholder="Votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <button
          type="button"
          className="inline-flex justify-center p-2 mx-5 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100"
          onClick={sendMessage}
        >
          <svg
            className="w-5 h-5 rotate-90 rtl:-rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="#1C64FE"
            viewBox="0 0 18 20"
          >
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>
      </div>
    </div>
  );
}

export default App;
