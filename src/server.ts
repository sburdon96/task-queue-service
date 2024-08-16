import express from 'express';
import taskRouter from './routes/task.route';

export const createServer = () => {
    const app = express();

    app.use(express.json());

    // API routes
    app.use('/api', taskRouter);

    // app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    //     console.error(err.stack);
    //     res.status(500).send('Something went wrong!');
    // });

    return app;
};
