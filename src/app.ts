import "reflect-metadata";
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import { createServer } from './server';
import { initialiseWorker } from "./utils/worker-manager";

dotenv.config();

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Data Source has been initialised!");

        const app = createServer();
        const PORT = Number(process.env.PORT) ?? 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        initialiseWorker();
    } catch (error) {
        console.error("Error during Data Source initialisation:", error);
        process.exit(1);
    }
};

startServer();
