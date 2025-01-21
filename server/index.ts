import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth"
import lessonRoutes from "./routes/lessons"
import quizRoutes from "./routes/quizzes"
import userRoutes from "./routes/users"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/lessons", lessonRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/users", userRoutes)

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

