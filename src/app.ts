import "reflect-metadata";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import { createServer } from './server';
import { initialiseWorker } from "./utils/worker-manager";

dotenv.config();

const startServer = async () => {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Data Source has been initialized!");

        // Create and start the Express server
        const app = createServer();
        const PORT = Number(process.env.PORT) ?? 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        initialiseWorker();
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }
};

startServer();
