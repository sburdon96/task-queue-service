import express from 'express';
import { TaskController } from '../controllers/task.controller';

const router = express.Router();
const taskController = new TaskController();

// Define routes
router.post('/tasks', (req, res) => taskController.createTask(req, res));

// Export the router
export default router;
