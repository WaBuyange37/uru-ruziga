import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

export const login = (email: string, password: string) => api.post("/auth/login", { email, password })

export const register = (username: string, email: string, password: string) =>
  api.post("/auth/register", { username, email, password })

export const getLessons = () => api.get("/lessons")

export const getQuizzes = () => api.get("/quizzes")

export const getUserProfile = () => api.get("/users/profile")

export const updateUserProfile = (data: { username: string; email: string }) => api.put("/users/profile", data)

export default api

