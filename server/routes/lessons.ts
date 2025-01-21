import express from "express"
import Lesson from "../models/Lesson"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const lessons = await Lesson.find().sort("order")
    res.json(lessons)
  } catch (error) {
    res.status(500).json({ message: "Error fetching lessons" })
  }
})

router.post("/", async (req, res) => {
  try {
    const lesson = new Lesson(req.body)
    await lesson.save()
    res.status(201).json(lesson)
  } catch (error) {
    res.status(500).json({ message: "Error creating lesson" })
  }
})

export default router

