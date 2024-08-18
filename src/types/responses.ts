import { TaskStatus } from "../models/task";

export interface TaskResponse {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}