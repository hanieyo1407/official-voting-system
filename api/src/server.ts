// api/src/server.ts

import express, {Request, Response} from 'express';
import appRoute from './routes/app.route';
import runoffRoute from './routes/runoff.route';
import electionRoute from './routes/election.route';
import cookieParser from "cookie-parser";
import cors from 'cors'; 
import dotenv from 'dotenv'; // 1. ADDED: Import dotenv

dotenv.config(); // 2. CONFIGURE: Load environment variables

const app = express();

// 3. MODIFIED: Dynamic CORS Configuration (Production Ready)
const corsOptions = {
    // USE ENV VARIABLE for dynamic origin
    origin: process.env.FRONTEND_URL || 'https://dmiv.netlify.app', 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); // Apply CORS middleware

// Body parsing middleware - ORDER MATTERS!
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use(express.static('public'));

// 4. ROUTING FIX: Align with /api/app prefix from documentation
app.use("/api/app", appRoute); // Changed back from /api/app to /api/v1

// Mount runoff routes
appRoute.use("/runoff", runoffRoute); 

// Mount election management routes
appRoute.use("/election", electionRoute);

app.get('/', (req: Request, res: Response)=> {
   res.send("server Working Well");
})
export default app;
