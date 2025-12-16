import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './routes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const connectionString = process.env.MONGO_URI;

try {
    await mongoose.connect(connectionString);
    console.log("Database Connected!");
} catch (err) {
    console.error("Database Error:", err);
}

app.use(router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));