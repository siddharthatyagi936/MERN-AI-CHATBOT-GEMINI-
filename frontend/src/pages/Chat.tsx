import React, { useEffect, useState, useRef } from "react";
import { Box, Avatar, Typography, Button, IconButton } from "@mui/material";
import red from "@mui/material/colors/red";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend, IoMdMic } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { deleteUserChat, getUserChat, sendChatRequest } from "../helpers/api-communicator";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null); // For auto-scroll
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [glowEffect, setGlowEffect] = useState(false);

  // Handles sending chat messages
  const handleSubmit = async () => {
    const content = inputRef.current?.value?.trim();
    if (!content) return;

    if (inputRef && inputRef.current) {
      inputRef.current.value = "";
    }

    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      const chatData = await sendChatRequest(content);
      if (chatData?.chats) {
        setChatMessages((prev) => [...prev, ...chatData.chats]);
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Handles clearing chat messages
  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChat();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.error(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  // Fetch initial chat messages
  useEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      toast.loading("Loading Chats", { id: "loadchats" });
      getUserChat()
        .then((data) => {
          if (Array.isArray(data.chats)) {
            setChatMessages(data.chats);
            toast.success("Successfully loaded chats", { id: "loadchats" });
          } else {
            toast.error("Chats data is not in expected format", { id: "loadchats" });
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Loading Failed", { id: "loadchats" });
        });
    }
  }, [auth]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  // Speech-to-text functionality
  const handleSpeechToText = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      toast.error("Speech Recognition API not supported in this browser.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
  
    recognition.onstart = () => {
      console.log("Speech recognition started.");
      setIsListening(true);
      setGlowEffect(true);
    };
  
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized speech:", transcript);
  
      // Automatically submit the recognized text as a chat message
      const newMessage: Message = { role: "user", content: transcript };
      setChatMessages((prev) => [...prev, newMessage]);
  
      sendChatRequest(transcript)
        .then((response) => {
          if (response?.chats) {
            setChatMessages((prev) => [...prev, ...response.chats]);
          }
        })
        .catch((err) => {
          console.error("Error sending chat message:", err);
          toast.error("Failed to process speech input.");
        });
    };
  
    recognition.onerror = (error: SpeechRecognitionErrorEvent) => {
      console.error("Speech Recognition Error:", error.error);
      toast.error(`Speech recognition error: ${error.error || "Unknown error"}.`);
      setIsListening(false);
      setGlowEffect(false);
    };
  
    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false);
      setGlowEffect(false);
    };
  
    recognition.start();
  };
  
  

  return (
    <Box className={`app-container ${isListening ? "active" : ""}`}>
      <Box sx={{ display: "flex", flex: 1, width: "100%", height: "100%", mt: 3, gap: 3 }}>
        <Box sx={{ display: { md: "flex", xs: "none", sm: "none" }, flex: 0.2, flexDirection: "column" }}>
          <Box sx={{ display: "flex", width: "100%", height: "60vh", bgcolor: "rgb(17,29,39)", borderRadius: 5, flexDirection: "column", mx: 3 }}>
            <Avatar sx={{ mx: "auto", my: 2, bgcolor: "white", color: "black", fontWeight: 700 }}>
              {auth?.user?.name[0]}{auth?.user?.name.split(" ")[1][0]}
            </Avatar>
            <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>You are talking to a ChatBOT</Typography>
            <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
              You can ask some questions related to Knowledge, Business, Advice, Education, etc. But avoid sharing personal information.
            </Typography>
            <Button onClick={handleDeleteChats} sx={{ width: "200px", my: "auto", color: "white", fontWeight: "700", borderRadius: 3, mx: "auto", bgcolor: red[300], ":hover": { bgcolor: red.A400 } }}>
              Clear Conversation
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flex: { md: 0.8, xs: 1, sm: 1 }, flexDirection: "column", px: 3 }}>
          <Typography sx={{ fontSize: "40px", color: "white", mb: 2, mx: "auto", fontWeight: "600" }}>
            S.A.I-Bot
          </Typography>
          <Box ref={chatBoxRef} sx={{ width: "100%", height: "60vh", borderRadius: 3, mx: "auto", display: "flex", flexDirection: "column", overflow: "scroll", overflowX: "hidden", overflowY: "auto", scrollBehavior: "smooth" }}>
            {chatMessages.map((chat, index) => (
              <ChatItem content={chat.content} role={chat.role} key={index} />
            ))}
          </Box>
          <div style={{ width: "100%", borderRadius: 8, backgroundColor: "rgb(17,27,39)", display: "flex", margin: "auto", marginTop: "-20px", alignItems: "center" }}>
            <input ref={inputRef} type="text" placeholder="Type your message or use the microphone" style={{ width: "100%", backgroundColor: "transparent", padding: "30px", border: "none", outline: "none", color: "white", fontSize: "20px", alignContent: "flex-end" }} />
            <div className="speech-button-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconButton onClick={handleSpeechToText} className={`speech-button ${glowEffect ? "active" : ""}`} sx={{ color: "white", mx: 1, border: "2px solid white", borderRadius: "50%", padding: "10px", transition: "transform 0.3s", ":hover": { transform: "scale(1.1)", backgroundColor: "#3b82f6" } }}>
                <IoMdMic size={30} />
              </IconButton>
              <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
                <IoMdSend />
              </IconButton>
            </div>
          </div>
        </Box>
      </Box>
    </Box>

)
};

export default Chat;
