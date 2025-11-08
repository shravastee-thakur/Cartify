import express, {Express} from "express"
import dotenv from "dotenv"
import cors from "cors"
import {connectDb} from "./utils/db"

const app: Express = express()

dotenv.config()

const PORT = process.env.PORT || 5000

// Database
connectDb()


// Middleware
app.use(cors({
    origin: process.env.HOST_URL,
    credentials: true
}))

app.listen(PORT, () => {
    console.log(`Listening to port: http://localhost:${PORT}`);
})