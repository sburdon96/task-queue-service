import { container } from 'tsyringe';
import { TaskService } from './services/task.service';
import { AppDataSource } from './data-source';
import { Task } from './models/task';

container.registerInstance('TaskRepository', AppDataSource.getRepository(Task));
container.register('TaskService', { useClass: TaskService });

