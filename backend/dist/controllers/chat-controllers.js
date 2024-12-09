import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/User.js";
export const generateChatCompletion = async (req, res, next) => {
    const { message } = req.body;
    const user = await User.findById(res.locals.jwtData.id);
    //console.log(res.locals.jwtData.id);
    if (!user)
        return res.status(401).json({ message: "User not registered or Token malfunctioned" });
    // Grab chats of the user
    const chats = user.chats.map(({ role, content }) => ({ role, content }));
    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });
    await user.save();
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Gemini API key not configured" });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
        const chatSession = model.startChat({ generationConfig });
        // Convert your existing chat history to the format expected by Gemini
        const geminiHistory = chats.map(({ role, content }) => ({
            author: role === 'user' ? 'USER' : 'BOT',
            content: content,
        }));
        //console.log(geminiHistory);
        const result = await chatSession.sendMessage(geminiHistory.map(({ content }) => content));
        //console.log(result)
        //const responseText = result?.response?.text;
        // Check if the response text is valid
        const responseText = result?.response?.text
            ? (typeof result.response.text === 'function' ? result.response.text() : result.response.text)
            : "No response from Gemini";
        user.chats.push({ content: responseText, role: 'assistant' });
        await user.save();
        //console.log(responseText);
        return res
            .status(200).json({ message: responseText, chats: user.chats });
    }
    catch (error) {
        // Log the full error to identify more details
        console.error("Error with Gemini API:", error);
        // Specific error handling based on the error type
        if (error.response) {
            // If Gemini API provides a response, log it
            console.error("Gemini API Error Response:", error.response.data);
            return res.status(500).json({
                message: "Error communicating with Gemini API.",
                errorDetails: error.response.data,
            });
        }
        else if (error.request) {
            // If no response from Gemini API
            console.error("No response from Gemini API:", error.request);
            return res.status(500).json({
                message: "No response from Gemini API.",
                errorDetails: error.request,
            });
        }
        else {
            // General error
            console.error("Error Message:", error.message);
            return res.status(500).json({
                message: "An unexpected error occurred.",
                errorDetails: error.message,
            });
        }
    }
};
export const sendChatsToUser = async (req, res, next) => {
    try {
        // Ensure the token is validated before accessing user data
        if (!res.locals.jwtData || !res.locals.jwtData.id) {
            return res.status(401).json({ message: "Invalid Token Data" });
        }
        // Find user by ID in the database
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        // Make sure the user ID matches the ID from the JWT token
        if (user._id.toString() !== res.locals.jwtData.id.toString()) {
            return res.status(401).send("Permissions didn't match");
        }
        return res.status(200).json({ message: "OK", chats: user.chats || [], });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};
export const deleteChats = async (req, res, next) => {
    try {
        //user token check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).send("User not registered OR Token malfunctioned");
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions didn't match");
        }
        //@ts-ignore
        user.chats = [];
        await user.save();
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
};
// Function to create and schedule a reminder
//# sourceMappingURL=chat-controllers.js.map