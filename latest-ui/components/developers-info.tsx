"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Code, Github, Linkedin, Mail, Globe, Users, Star, Coffee, Heart, Zap, Rocket, Award } from "lucide-react"

interface Developer {
  id: string
  name: string
  role: string
  specialization: string[]
  avatar: string
  bio: string
  github?: string
  linkedin?: string
  email?: string
  website?: string
  contributions: string[]
  favoriteTools: string[]
  experience: string
}

export default function DevelopersInfo() {
  const developers: Developer[] = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Full Stack Developer & Team Lead",
      specialization: ["React", "Node.js", "TypeScript", "System Architecture"],
      avatar: "AJ",
      bio: "Passionate full-stack developer with 5+ years of experience in building scalable web applications. Led the overall architecture and backend development of the Mark Input System.",
      github: "https://github.com/alexjohnson",
      linkedin: "https://linkedin.com/in/alexjohnson",
      email: "alex.johnson@email.com",
      website: "https://alexjohnson.dev",
      contributions: [
        "System Architecture Design",
        "Authentication & Authorization",
        "Database Schema Design",
        "API Development",
        "Team Coordination",
      ],
      favoriteTools: ["Next.js", "PostgreSQL", "Docker", "AWS", "TypeScript"],
      experience: "5+ years",
    },
    {
      id: "2",
      name: "Sarah Chen",
      role: "Frontend Developer & UI/UX Designer",
      specialization: ["React", "UI/UX Design", "Tailwind CSS", "Component Libraries"],
      avatar: "SC",
      bio: "Creative frontend developer and designer who loves crafting beautiful, intuitive user interfaces. Responsible for the entire UI/UX design and frontend implementation.",
      github: "https://github.com/sarahchen",
      linkedin: "https://linkedin.com/in/sarahchen",
      email: "sarah.chen@email.com",
      contributions: [
        "UI/UX Design System",
        "Component Library Development",
        "Responsive Design Implementation",
        "User Experience Optimization",
        "Design Prototyping",
      ],
      favoriteTools: ["Figma", "React", "Tailwind CSS", "Framer Motion", "Storybook"],
      experience: "4+ years",
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      role: "Backend Developer & Database Specialist",
      specialization: ["Node.js", "Database Design", "API Development", "Security"],
      avatar: "MR",
      bio: "Backend specialist with expertise in database optimization and API security. Focused on building robust, scalable server-side solutions for the education sector.",
      github: "https://github.com/michaelrodriguez",
      linkedin: "https://linkedin.com/in/michaelrodriguez",
      email: "michael.rodriguez@email.com",
      contributions: [
        "Database Optimization",
        "RESTful API Development",
        "Security Implementation",
        "Performance Monitoring",
        "Data Migration Scripts",
      ],
      favoriteTools: ["Express.js", "MongoDB", "Redis", "JWT", "Postman"],
      experience: "4+ years",
    },
    {
      id: "4",
      name: "Emily Wang",
      role: "Frontend Developer & Testing Specialist",
      specialization: ["React", "Testing", "Quality Assurance", "Performance Optimization"],
      avatar: "EW",
      bio: "Detail-oriented developer specializing in frontend development and comprehensive testing. Ensures code quality and optimal performance across all user interfaces.",
      github: "https://github.com/emilywang",
      linkedin: "https://linkedin.com/in/emilywang",
      email: "emily.wang@email.com",
      contributions: [
        "Component Testing",
        "End-to-End Testing",
        "Performance Optimization",
        "Code Quality Assurance",
        "Bug Tracking & Resolution",
      ],
      favoriteTools: ["Jest", "Cypress", "React Testing Library", "Lighthouse", "ESLint"],
      experience: "3+ years",
    },
    {
      id: "5",
      name: "David Kim",
      role: "DevOps Engineer & Documentation Lead",
      specialization: ["DevOps", "CI/CD", "Cloud Infrastructure", "Documentation"],
      avatar: "DK",
      bio: "DevOps engineer passionate about automation and efficient deployment pipelines. Also leads documentation efforts to ensure comprehensive project knowledge sharing.",
      github: "https://github.com/davidkim",
      linkedin: "https://linkedin.com/in/davidkim",
      email: "david.kim@email.com",
      contributions: [
        "CI/CD Pipeline Setup",
        "Cloud Infrastructure Management",
        "Deployment Automation",
        "Technical Documentation",
        "Monitoring & Logging",
      ],
      favoriteTools: ["Docker", "Kubernetes", "GitHub Actions", "AWS", "Terraform"],
      experience: "4+ years",
    },
  ]

  const projectStats = {
    totalCommits: "1,247",
    linesOfCode: "45,892",
    components: "127",
    testCoverage: "94%",
    developmentTime: "6 months",
    technologies: 15,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Meet Our Development Team
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A passionate group of five developers who collaborated to create this comprehensive Mark Input System for
          educational institutions.
        </p>
      </div>

      {/* Project Stats */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            Project Statistics
          </CardTitle>
          <CardDescription>Key metrics from our development journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{projectStats.totalCommits}</div>
              <div className="text-sm text-gray-600">Total Commits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{projectStats.linesOfCode}</div>
              <div className="text-sm text-gray-600">Lines of Code</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{projectStats.components}</div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{projectStats.testCoverage}</div>
              <div className="text-sm text-gray-600">Test Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{projectStats.developmentTime}</div>
              <div className="text-sm text-gray-600">Development Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{projectStats.technologies}</div>
              <div className="text-sm text-gray-600">Technologies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {developers.map((developer, index) => (
          <Card
            key={developer.id}
            className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20 bg-gradient-to-r from-purple-500 to-pink-500">
                  <AvatarFallback className="text-white font-bold text-xl">{developer.avatar}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">{developer.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-purple-600">{developer.role}</CardDescription>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">{developer.experience} experience</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{developer.bio}</p>

              {/* Specializations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  Specializations
                </h4>
                <div className="flex flex-wrap gap-1">
                  {developer.specialization.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3 pt-2">
                {developer.github && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(developer.github, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                )}
                {developer.linkedin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(developer.linkedin, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                )}
                {developer.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${developer.email}`, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                )}
                {developer.website && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(developer.website, "_blank")}
                    className="h-8 w-8 p-0"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Detailed Info Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                  <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500">
                        <AvatarFallback className="text-white font-bold text-lg">{developer.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">{developer.name}</DialogTitle>
                        <DialogDescription className="text-lg font-medium text-purple-600">
                          {developer.role}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">{developer.bio}</p>

                    {/* Contributions */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        Key Contributions
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {developer.contributions.map((contribution, contribIndex) => (
                          <div key={contribIndex} className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-700">{contribution}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Favorite Tools */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-brown-600" />
                        Favorite Tools & Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {developer.favoriteTools.map((tool, toolIndex) => (
                          <Badge key={toolIndex} className="bg-blue-100 text-blue-800 border-blue-200">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Contact Links */}
                    <div className="flex justify-center gap-4 pt-4 border-t">
                      {developer.github && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(developer.github, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </Button>
                      )}
                      {developer.linkedin && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(developer.linkedin, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </Button>
                      )}
                      {developer.email && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(`mailto:${developer.email}`, "_blank")}
                          className="flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Message */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Passion</h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            This Mark Input System was crafted with dedication and attention to detail by our team of five passionate
            developers. We believe in creating solutions that make education management more efficient and
            user-friendly. Thank you for using our system!
          </p>
          <div className="mt-6">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-lg">
              Made with ❤️ by Team X
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
