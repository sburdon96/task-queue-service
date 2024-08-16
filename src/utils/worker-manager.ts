import { taskWorker } from './worker';

export const initialiseWorker = () => {
    // Handle worker events
    taskWorker.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
    });

    taskWorker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed: ${err.message}`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal: string) => {
        console.log(`${signal} received. Shutting down worker...`);
        try {
            await taskWorker.close();
            console.log('Worker shut down gracefully.');
        } catch (error) {
            console.error('Error during worker shutdown:', error);
        } finally {
            process.exit(0);
        }
    };

    // Listen for termination signals
    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

    console.log('Worker initialised and ready to process jobs.');
};
