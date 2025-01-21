import mongoose from "mongoose"

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true },
    },
  ],
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Quiz", quizSchema)

