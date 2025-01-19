import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

const courses = [
  {
    id: 1,
    title: "Umwero Basics",
    description: "Learn the fundamentals of the Umwero alphabet",
    modules: 5,
    duration: "4 weeks",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Intermediate Umwero",
    description: "Advance your Umwero skills with complex characters and words",
    modules: 7,
    duration: "6 weeks",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Advanced Umwero and Cultural Studies",
    description: "Master Umwero and dive deep into Rwandan cultural context",
    modules: 10,
    duration: "8 weeks",
    level: "Advanced",
  },
]

export function AvailableCourses() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#8B4513]">Available Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">{course.title}</CardTitle>
              <CardDescription className="text-[#D2691E]">{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline">{course.level}</Badge>
                <span className="text-[#8B4513]">{course.duration}</span>
              </div>
              <p className="text-[#8B4513] mb-4">{course.modules} modules</p>
              <Button className="w-full">Enroll Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

