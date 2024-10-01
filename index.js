import express from 'express';
import dotenv from 'dotenv';
import { mongoose } from 'mongoose';
import cors from 'cors';
import userRoute from './routes/userRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import teamRouter from './routes/teamRoutes.js';

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Routes
app.use('/api/users', userRoute);
app.use('/api/tasks', taskRouter);
app.use('/api/team', teamRouter);

// Connect to MongoDB Atlas
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Could not connect to MongoDB Atlas', err));

// Start server
app.listen(process.env.PORT, () => console.log(`Server is running on port http://localhost:${process.env.PORT}`));
