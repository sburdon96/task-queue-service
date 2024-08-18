import { Worker } from 'bullmq';
import { AppDataSource } from '../data-source';
import { Task } from '../models/task';
import { redisConnection } from './task-queue';

export const taskWorker = new Worker('taskQueue', async (job) => {
    const taskRepository = AppDataSource.getRepository(Task);

    const task = await taskRepository.findOneBy({ id: job.data.id });
    if (task) {
        try {
            task.status = 'IN_PROGRESS';
            await taskRepository.save(task);

            // Simulate processing
            console.log(`Processing task: ${task.title}`);

            task.status = 'COMPLETED';
            await taskRepository.save(task);
        } catch (error) {
            task.status = 'FAILED';
            await taskRepository.save(task);
            console.error(`Failed to process task ${task.id}:`, error);
        }
    }
}, { connection: redisConnection });
