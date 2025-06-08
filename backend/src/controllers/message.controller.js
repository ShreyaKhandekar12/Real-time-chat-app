import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import axios from "axios";
import fetch from "node-fetch";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json("Internal Server Error");
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageURL;
    if (image) {
      const upload_res = await cloudinary.uploader.upload(image);
      imageURL = upload_res.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageURL,
    });

    await newMessage.save();

    //TODO: realtime functionality goes here => socket.io  ===> todo done
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Erro in sendMessage controller: ", error.message);
    res.status(500).json("Internal Server Error");
  }
};

async function generateContentWithGemini(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error.message}`);
  }

  const data = await response.json();
  return data; // This will have the generated content
}

const summarizeChat = async (req, res) => {
  try {
    const messages = req.body.messages; // expect array of messages as strings

    const promptText = messages.join("\n\n");

    const result = await generateContentWithGemini(`Summarize this chat conversation:\n\n${promptText}`);

    // The structure of response depends on API; you’ll have to check 'result' for generated text
    const summary = result?.candidates?.[0]?.content || "No summary available";

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error summarizing chat:", error);
    res.status(500).json({ error: error.message });
  }
};



export { getUsersForSidebar, getMessages, sendMessage, summarizeChat };
