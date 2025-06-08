import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  summarizeChat,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", verifyJWT, getUsersForSidebar);
router.get("/:id", verifyJWT, getMessages);
router.post("/send/:id", verifyJWT, sendMessage);
router.post("/summarize", summarizeChat);

export default router;
