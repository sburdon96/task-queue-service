import { Task } from '../models/task';
import { TaskResponse } from '../types/responses';

export const mapTaskToResponse = (task: Task): TaskResponse => {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.created_at.toISOString(),
        updatedAt: task.updated_at.toISOString(),
    };
}
