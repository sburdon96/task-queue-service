import '../container'

import express from 'express';
import { TaskController } from '../controllers/task.controller';
import { container } from 'tsyringe';

const router = express.Router();
const taskController = container.resolve(TaskController);

// Define routes
router.post('/tasks', (req, res) => taskController.createTask(req, res));
router.get('/tasks', (req, res) => taskController.getAllTasks(req, res));
router.get('/tasks/:id', (req, res) => taskController.getTaskById(req, res));
router.put('/tasks/:id', (req, res) => taskController.updateTaskStatus(req, res));
router.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));

// Export the router
export default router;
