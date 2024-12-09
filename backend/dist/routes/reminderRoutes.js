import express from 'express';
import { verifyToken } from '../utils/token-manager.js';
import { setReminder } from '../controllers/chat-controllers.js';
// Token verification middleware
const reminderRoutes = express.Router();
// POST route to set a reminder
reminderRoutes.post('/reminder', verifyToken, setReminder);
export default reminderRoutes;
//# sourceMappingURL=reminderRoutes.js.map