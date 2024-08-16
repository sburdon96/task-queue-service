import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Task } from '../models/task';
import { taskQueue } from '../utils/task-queue';

export class TaskService {
    constructor(
        private readonly taskRepository: Repository<Task> = AppDataSource.getRepository(Task)
    ) {}

    async createTask(title: string, description: string): Promise<Task> {
        const task = this.taskRepository.create({
            title,
            description,
            status: 'PENDING',
        });

        const savedTask = await this.taskRepository.save(task);

        await taskQueue.add(title, { id: savedTask.id });

        return savedTask;
    }

    async findTaskById(id: number): Promise<Task | null> {
        return this.taskRepository.findOneBy({ id });
    }
}
