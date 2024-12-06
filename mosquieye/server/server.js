import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/Users.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  // Don't log body here since we need raw body for webhook
  next();
});

app.use(cors());

// Important: Raw body parser must come before express.json()
app.post('/api/webhooks', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
        console.log('Webhook received');
        const payloadString = req.body.toString();
        const svixHeaders = req.headers;

        console.log('Webhook payload:', payloadString);
        console.log('Webhook headers:', svixHeaders);

        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
        const evt = wh.verify(payloadString, svixHeaders);
        const eventData = JSON.parse(payloadString);
        
        console.log('Event type:', eventData.type);
        console.log('Event data:', eventData.data);

        if (eventData.type === 'user.created') {
            const userData = eventData.data;
            const userDetails = {
                clerkUserId: userData.id,
                email: userData.email_addresses[0].email_address,
                firstName: userData.first_name,
                lastName: userData.last_name
            };

            console.log('Saving user to MongoDB:', userDetails);

            const newUser = new User(userDetails);
            await newUser.save();

            console.log('User saved successfully:', newUser);
            
            res.json({
                success: true,
                message: 'User saved to MongoDB',
                user: newUser
            });
        } else {
            res.json({ message: 'Event processed but not saved' });
        }
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(400).json({ 
            error: err.message,
            message: 'Error processing webhooks'
        });
    }
});

// Regular routes
app.use(express.json());
app.use('/api/users', userRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});