import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/Users.js';
import userRoutes from './routes/user.js';
import imagesRoutes from './routes/images.js';
import schedulesRouter from './routes/schedules.js';
import ovitrapsRouter from './routes/ovitraps.js';
import dashboardRouter from './routes/dashboard.js';

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
    ? ['https://mosquieye-prod.vercel.app/']
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
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MosquiEye API Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .status { 
            color: #22c55e;
            font-weight: bold;
          }
          .endpoints {
            background: #fff;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🦟 MosquiEye API Server</h1>
          <p class="status">Status: Running</p>
          <div class="endpoints">
            <h2>Available Endpoints:</h2>
            <ul>
              <li>/api/images - Image analysis endpoints</li>
              <li>/api/users - User management endpoints</li>
              <li>/api/schedules - Schedule management endpoints</li>
            </ul>
          </div>
          <p>For more information, visit our <a href="https://github.com/Phishing-Coders/MosquiEyeReact">documentation</a></p>
        </div>
      </body>
    </html>
  `);
});
app.use('/api/users', userRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/schedules', schedulesRouter);
app.use('/api/ovitraps', ovitrapsRouter);
app.use('/api/dashboard', dashboardRouter);

// Update MongoDB connection with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, {
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