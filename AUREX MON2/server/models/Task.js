import mongoose from "mongoose"
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,
  priority: { type: String, enum: ["High","Medium","Low"], default: "Medium" },
  due: String,
  status: { type: String, enum: ["Pending","Completed"], default: "Pending" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true })
export default mongoose.model("Task", taskSchema)