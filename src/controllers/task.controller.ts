import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { TaskStatus } from '../models/task';
import { inject, injectable } from 'tsyringe';

@injectable()
export class TaskController {
    constructor(@inject('TaskService') private readonly taskService: TaskService) {}

    // POST /tasks
    async createTask(req: Request, res: Response): Promise<Response> {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        try {
            const task = await this.taskService.createTask(title, description);
            return res.status(201).json(task);
        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // GET /tasks
    async getAllTasks(req: Request, res: Response): Promise<Response> {
        try {
            const tasks = await this.taskService.getAllTasks();
            return res.status(200).json(tasks);
        } catch (error) {
            console.error('Error retrieving tasks:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // GET /tasks/:id
    async getTaskById(req: Request, res: Response): Promise<Response> {
        const taskId = parseInt(req.params.id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        try {
            const task = await this.taskService.getTaskById(taskId);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            return res.status(200).json(task);
        } catch (error) {
            console.error(`Error retrieving task with ID ${taskId}:`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // PUT /tasks/:id
    async updateTaskStatus(req: Request, res: Response): Promise<Response> {
        const taskId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const validation = validateTaskStatus(status);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        try {
            const updatedTask = await this.taskService.updateTaskStatus(taskId, status);
            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            return res.status(200).json(updatedTask);
        } catch (error: any) {
            console.error(`Error updating task status with ID ${taskId}:`, error);
            return res.status(400).json({ message: error.message });
        }
    }

    // DELETE /tasks/:id
    async deleteTask(req: Request, res: Response): Promise<Response> {
        const taskId = parseInt(req.params.id, 10);

        if (isNaN(taskId)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        try {
            const task = await this.taskService.getTaskById(taskId);
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (task.status === 'PENDING') {
                await this.taskService.removeTaskFromQueue(task.title);
            }

            await this.taskService.deleteTask(taskId);

            return res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error: any) {
            console.error(`Error deleting task with ID ${taskId}:`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

const validateTaskStatus = (status: TaskStatus): { isValid: boolean; message?: string } => {
    const validStatuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
    
    if (status === 'IN_PROGRESS') {
        return { isValid: false, message: `The status 'IN_PROGRESS' is not allowed. Use 'PENDING' instead.` };
    }
    if (!validStatuses.includes(status)) {
        return { isValid: false, message: `Invalid status: '${status}'. Valid statuses are: 'PENDING', 'COMPLETED', 'FAILED'.` };
    }
    return { isValid: true };
}
