import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
    constructor(
        private readonly taskService: TaskService = new TaskService()
    ) {}

    async createTask(req: Request, res: Response): Promise<Response> {
        const { title, description } = req.body;

        // Validate
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
}
