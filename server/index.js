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
app.use(cors());
app.use(express.json());

app.use('/api/contests', contestRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/users', UsersRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});