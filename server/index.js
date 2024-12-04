import express from 'express';
import cors from 'cors';
import env from 'dotenv';
import mongoose from 'mongoose';
import contestRoutes from './routes/contests.js';
import standingsRoutes from './routes/standings.js';
import UsersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

env.config();
const app = express();
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL,
    credentials: true,
}));
app.use(express.json());

app.use('/api/contests', contestRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/users', UsersRoutes);
app.use('/api/admin', adminRoutes);

const connectWithRetry = async () => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5000; // 5 seconds
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(process.env.CONNECTION_STRING, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxPoolSize: 50,
                family: 4,
            });

            console.log('Successfully connected to MongoDB');

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                if (err.name === 'MongoNetworkError') {
                    console.log('Attempting to reconnect to MongoDB...');
                    setTimeout(connectWithRetry, RETRY_DELAY);
                }
            });

            process.on('SIGINT', async () => {
                try {
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed through app termination');
                    process.exit(0);
                } catch (err) {
                    console.error('Error during MongoDB connection closure:', err);
                    process.exit(1);
                }
            });

            return;
        } catch (err) {
            retries += 1;
            console.error(`MongoDB connection attempt ${retries} failed:`, err);

            if (retries === MAX_RETRIES) {
                console.error('Maximum connection retries reached. Exiting application.');
                process.exit(1);
            }

            console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
};

const startServer = async () => {
    try {
        await connectWithRetry();

        app.listen(5000, () => {
            console.log('Server running on port 5000');
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();