import { Worker } from 'bullmq';
import { AppDataSource } from '../data-source';
import { Task } from '../models/task';
import { redisConnection } from './task-queue';

export const taskWorker = new Worker('taskQueue', async (job) => {
    const taskRepository = AppDataSource.getRepository(Task);

    // Find the task by ID and process it
    const task = await taskRepository.findOneBy({ id: job.data.id });
    if (task) {
        try {
            task.status = 'IN_PROGRESS';
            await taskRepository.save(task);

            // Simulate task processing
            console.log(`Processing task: ${task.title}`);

            // Done
            task.status = 'COMPLETED';
            await taskRepository.save(task);
        } catch (error) {
            // Handle processing failure
            task.status = 'FAILED';
            await taskRepository.save(task);
            console.error(`Failed to process task ${task.id}:`, error);
        }
    }
}, { connection: redisConnection });
