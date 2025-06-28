import { useChatStore } from "../store/useChatStore.js";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { toast } from "react-hot-toast";
import axios from "axios";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeToMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const handleSummarizeChat = async () => {
    try {
      const textMessages = messages
        .filter((msg) => msg.text)
        .map(
          (msg) =>
            `${msg.senderId === authUser._id ? "You" : selectedUser.fullName}: ${msg.text}`
        );

  const baseURL =
          import.meta.env.MODE === "development"? "http://localhost:5001/api" : "/api";

  const res = await axios.post(
    `${baseURL}/message/summarize`,
    { messages: textMessages },
    { withCredentials: true }
  );


      const summaryText =
        res.data?.summary?.parts?.[0]?.text || "No summary found.";
      setSummary(summaryText);
      setShowSummary(true);
      toast.success("Summary generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate summary");
    }
  };

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeToMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <button
          className="btn btn-sm btn-outline self-end mr-4 mb-2"
          onClick={handleSummarizeChat}
        >
          Summarize Chat
        </button>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {showSummary && (
        <div className="p-4 mx-4 mb-2 bg-base-300 rounded-lg border border-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Chat Summary
            </h2>
            <button
              className="btn btn-xs btn-outline btn-error"
              onClick={() => setShowSummary(false)}
            >
              Close
            </button>
          </div>
          <p className="text-sm text-white whitespace-pre-line">{summary}</p>
        </div>
      )}


      <div className="flex justify-end mr-4 mb-2">
        <button className="btn btn-sm btn-outline" onClick={handleSummarizeChat}>
          Summarize Chat
        </button>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
