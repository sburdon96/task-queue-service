import express from 'express';
import taskRouter from './routes/task.route';

export const createServer = () => {
    const app = express();

    app.use(express.json());

    app.use('/api', taskRouter);

    return app;
};
