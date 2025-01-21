import express from "express"
import Quiz from "../models/Quiz"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find()
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ message: "Error fetching quizzes" })
  }
})

router.post("/", async (req, res) => {
  try {
    const quiz = new Quiz(req.body)
    await quiz.save()
    res.status(201).json(quiz)
  } catch (error) {
    res.status(500).json({ message: "Error creating quiz" })
  }
})

export default router

