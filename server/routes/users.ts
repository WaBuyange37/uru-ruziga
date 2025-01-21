import express from "express"
import User from "../models/User"

const router = express.Router()

router.get("/profile", async (req, res) => {
  try {
    // Assuming we have middleware to attach the user to the request
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" })
  }
})

router.put("/profile", async (req, res) => {
  try {
    const { username, email } = req.body
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { username, email } }, { new: true }).select(
      "-password",
    )
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile" })
  }
})

export default router

