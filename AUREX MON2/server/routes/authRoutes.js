import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
const router = express.Router()

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token, user: { id: user._id, name, email } })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ msg: "User not found" })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(400).json({ msg: "Wrong password" })
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  res.json({ token, user: { id: user._id, name: user.name, email } })
})

export default router