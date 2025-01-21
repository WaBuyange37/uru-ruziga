import mongoose from "mongoose"

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Lesson", lessonSchema)

