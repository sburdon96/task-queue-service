import { Repository } from 'typeorm';
import { inject, injectable } from 'tsyringe';
import { Task, TaskStatus } from '../models/task';
import { taskQueue } from '../utils/task-queue';
import { mapTaskToResponse } from '../mappers/task.map';
import { TaskResponse } from '@src/types/responses';

@injectable()
export class TaskService {
    constructor(
        @inject('TaskRepository') private taskRepository: Repository<Task>
    ) {}

    async createTask(title: string, description: string): Promise<TaskResponse> {
        const task = this.taskRepository.create({
            title,
            description,
            status: 'PENDING',
        });

        const savedTask = await this.taskRepository.save(task);

        await taskQueue.add(title, { id: savedTask.id });

        return mapTaskToResponse(savedTask);
    }

    async getAllTasks(): Promise<TaskResponse[]> {
        const tasks = await this.taskRepository.find();
        return tasks.map(task => mapTaskToResponse(task));
    }

    async getTaskById(id: number): Promise<TaskResponse | null> {
        const task = await this.taskRepository.findOneBy({ id });
        return task ? mapTaskToResponse(task) : null;
    }

    async updateTaskStatus(id: number, status: TaskStatus): Promise<TaskResponse | null> {
        const task = await this.taskRepository.findOneBy({ id });
        if (!task) {
            return null;
        }

        task.status = status;

        const savedTask = await this.taskRepository.save(task);

        if (savedTask.status === 'PENDING') {
            await taskQueue.add(savedTask.title, { id: savedTask.id });
        }

        return mapTaskToResponse(savedTask);
    }

    async removeTaskFromQueue(taskName: string): Promise<void> {
        const job = await taskQueue.getJob(taskName);
        if (job) {
            await job.remove();
        }
    }

    async deleteTask(id: number): Promise<void> {
        await this.taskRepository.delete({ id });
    }
}
