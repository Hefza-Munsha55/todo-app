import express from "express"
import Task from "../models/Task.js"
import auth from "../middleware/auth.js"
const router = express.Router()

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 })
  res.json(tasks)
})

router.post("/", auth, async (req, res) => {
  const { title, desc, priority, due } = req.body
  const task = await Task.create({ title, desc, priority, due, user: req.user.id })
  res.status(201).json(task)
})

router.put("/:id", auth, async (req, res) => {
  const updated = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true })
  res.json(updated)
})

router.delete("/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  res.json({ message: "Deleted" })
})

export default router