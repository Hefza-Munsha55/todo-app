import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"
import taskRoutes from "./routes/taskRoutes.js"
import authRoutes from "./routes/authRoutes.js"

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/tasks", taskRoutes)
app.use("/api/auth", authRoutes)
app.get("/", (req,res)=>res.send("AUREX API Running"))

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>console.log(`✅ http://localhost:${PORT}`))