import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/Users.js';
import userRoutes from './routes/user.js';
import imagesRoutes from './routes/images.js';
import schedulesRouter from './routes/schedules.js'; // Ensure this import exists

dotenv.config();

const app = express();

// Increase payload size limits - add these before other middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  // Don't log body here since we need raw body for webhook
  next();
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

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

        if (eventData.type === 'user.created' || eventData.type === 'user.updated') {
            const userData = eventData.data;
            const userDetails = {
                clerkUserId: userData.id,
                email: userData.email_addresses[0].email_address,
                firstName: userData.first_name,
                lastName: userData.last_name,
                imageUrl: userData.image_url
            };

            console.log('Saving user to MongoDB:', userDetails);

            const updatedUser = await User.findOneAndUpdate(
                { clerkUserId: userDetails.clerkUserId },
                userDetails,
                { new: true, upsert: true, runValidators: true }
            );

            console.log('User saved successfully:', updatedUser);
            
            res.json({
                success: true,
                message: 'User saved to MongoDB',
                user: updatedUser
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
app.use('/api/images', imagesRoutes);
app.use('/api/schedules', schedulesRouter); // Ensure this line exists

// Update MongoDB connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority',
    retryReads: true
  })
  .then(() => {
    console.log('MongoDB Connected Successfully');
    console.log('Connection State:', mongoose.connection.readyState);
    console.log('Database Name:', mongoose.connection.name);
    
    // Only start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  });
};

// Initial connection attempt
connectWithRetry();

const PORT = process.env.PORT || 5000;

export default app;