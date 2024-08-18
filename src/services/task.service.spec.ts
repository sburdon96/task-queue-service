import 'reflect-metadata'
import { container } from 'tsyringe';
import { TaskService } from '../services/task.service';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../models/task';
import { mapTaskToResponse } from '../mappers/task.map';
import { taskQueue } from '../utils/task-queue';

// Mock the repository
const mockTaskRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<Repository<Task>>;

jest.mock('../utils/task-queue', () => ({
    taskQueue: {
        add: jest.fn(),
        getJob: jest.fn(),
        remove: jest.fn(),
    },
}));

describe('TaskService Unit Tests', () => {
    let taskService: TaskService;

    beforeEach(() => {
        container.clearInstances();

        container.registerInstance('TaskRepository', mockTaskRepository);

        taskService = container.resolve(TaskService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('should create and return a new task', async () => {
            const title = 'New Task';
            const description = 'Task description';
            const mockTask = {
                id: 1,
                title,
                description,
                status: 'PENDING',
                created_at: new Date(),
                updated_at: new Date(),
            } as Task;

            mockTaskRepository.create.mockReturnValue(mockTask);
            mockTaskRepository.save.mockResolvedValue(mockTask);

            const result = await taskService.createTask(title, description);

            expect(result).toEqual(mapTaskToResponse(mockTask));
            expect(mockTaskRepository.create).toHaveBeenCalledWith({
                title,
                description,
                status: 'PENDING',
            });
            expect(mockTaskRepository.save).toHaveBeenCalledWith(mockTask);
            expect(taskQueue.add).toHaveBeenCalledWith(title, { id: mockTask.id });
        });
    });

    describe('getAllTasks', () => {
        it('should return all tasks', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', description: 'Desc 1', status: 'PENDING', created_at: new Date(), updated_at: new Date() },
                { id: 2, title: 'Task 2', description: 'Desc 2', status: 'COMPLETED', created_at: new Date(), updated_at: new Date() },
            ] as Task[];
            mockTaskRepository.find.mockResolvedValue(mockTasks);

            const result = await taskService.getAllTasks();

            expect(result).toEqual(mockTasks.map(task => mapTaskToResponse(task)));
            expect(mockTaskRepository.find).toHaveBeenCalledTimes(1);
        });
    });

    describe('getTaskById', () => {
        it('should return the task if found', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Desc 1', status: 'PENDING', created_at: new Date(), updated_at: new Date() } as Task;
            mockTaskRepository.findOneBy.mockResolvedValue(mockTask);

            const result = await taskService.getTaskById(1);

            expect(result).toEqual(mapTaskToResponse(mockTask));
            expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return null if the task is not found', async () => {
            mockTaskRepository.findOneBy.mockResolvedValue(null);

            const result = await taskService.getTaskById(999);

            expect(result).toBeNull();
            expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
        });
    });

    describe('updateTaskStatus', () => {
        it('should update the status of the task and return the updated task', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Desc 1', status: 'PENDING', created_at: new Date(), updated_at: new Date() } as Task;
            mockTaskRepository.findOneBy.mockResolvedValue(mockTask);
            mockTaskRepository.save.mockResolvedValue({ ...mockTask, status: 'COMPLETED' });

            const result = await taskService.updateTaskStatus(1, 'COMPLETED' as TaskStatus);

            expect(result?.status).toBe('COMPLETED');
            expect(mockTaskRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockTaskRepository.save).toHaveBeenCalledWith({ ...mockTask, status: 'COMPLETED' });
        });

        it('should add the task to the queue if status is PENDING', async () => {
            const mockTask = { id: 1, title: 'Task 1', description: 'Desc 1', status: 'PENDING', created_at: new Date(), updated_at: new Date() } as Task;
            mockTaskRepository.findOneBy.mockResolvedValue(mockTask);
            mockTaskRepository.save.mockResolvedValue(mockTask);

            await taskService.updateTaskStatus(1, 'PENDING' as TaskStatus);

            expect(taskQueue.add).toHaveBeenCalledWith(mockTask.title, { id: mockTask.id });
        });

        it('should return null if task not found', async () => {
            mockTaskRepository.findOneBy.mockResolvedValue(null);

            const result = await taskService.updateTaskStatus(999, 'COMPLETED' as TaskStatus);

            expect(result).toBeNull();
            expect(mockTaskRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('removeTaskFromQueue', () => {
        it('should remove the task from the queue if found', async () => {
            const mockJob = { remove: jest.fn() };
            (taskQueue.getJob as jest.Mock).mockResolvedValue(mockJob);

            await taskService.removeTaskFromQueue('Task 1');

            expect(taskQueue.getJob).toHaveBeenCalledWith('Task 1');
            expect(mockJob.remove).toHaveBeenCalled();
        });

        it('should do nothing if the task is not in the queue', async () => {
            const mockJob = { remove: jest.fn() };
            (taskQueue.getJob as jest.Mock).mockResolvedValue(null);

            await taskService.removeTaskFromQueue('Task 1');

            expect(taskQueue.getJob).toHaveBeenCalledWith('Task 1');
            expect(mockJob.remove).toHaveBeenCalledTimes(0);
        });
    });

    describe('deleteTask', () => {
        it('should delete the task', async () => {
            await taskService.deleteTask(1);

            expect(mockTaskRepository.delete).toHaveBeenCalledWith({ id: 1 });
        });
    });
});
