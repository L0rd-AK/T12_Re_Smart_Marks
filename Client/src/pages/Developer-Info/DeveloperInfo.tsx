import { useState } from "react";
import { Github, Linkedin, Mail, Users } from "lucide-react";

interface Developer {
    id: string;
    name: string;
    role: string;
    avatar: string;
    specialization: string[];
    email: string;
    github?: string;
    linkedin?: string;
    bio: string;
    contributions: string[];
    favoriteTools: string[];
    experience: string;
}

const developers: Developer[] = [
    {
        id: "1",
        name: "Amit Kumar Ghosh",
        role: "Full Stack Developer & Team Lead",
        avatar: "https://amitkumarghosh.vercel.app/static/media/pasport.f3e55fdf3f4aeab78f67.jpg",
        specialization: ["React", "Node.js", "Express.js", "MongoDB", "TypeScript", "REST APIs"],
        email: "amitkumarghosh.dev@gmail.com",
        github: "https://github.com/L0rd-AK",
        linkedin: "https://linkedin.com/in/amit-kumar-ghosh",
        bio: "Passionate full-stack developer with expertise in modern web technologies. Led the development of the Smart Marks system with a focus on scalable architecture and user experience.",
        contributions: [
            "Backend API Development",
            "Database Optimization",
            "Server Configuration",
            "Performance Monitoring",
            "Security Implementation"
        ],
        favoriteTools: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Postman"],
        experience: "2+ years"
    },
    {
        id: "2",
        name: "Mehedi Hasan",
        role: "Full Stack Developer & Backend Specialist",
        avatar: "https://avatars.githubusercontent.com/u/103210884?v=4",
        specialization: ["React", "Next.js", "Node.js", "TypeScript", "MongoDB", "Express.js"],
        email: "mehedihasan.dev@gmail.com",
        github: "https://github.com/mehedihasan444",
        linkedin: "https://linkedin.com/in/mehedihasan444",
        bio: "Backend specialist focused on building robust server-side applications and APIs. Passionate about creating efficient database solutions and scalable backend architectures.",
        contributions: [
            "System Architecture Design",
            "Authentication & Authorization",
            "Database Schema Design",
            "API Development",
            "Team Coordination"
        ],
        favoriteTools: ["React", "Node.js", "MongoDB", "TypeScript", "Express.js"],
        experience: "2+ years"
    },
    {
        id: "3",
        name: "Al Amin",
        role: "Full Stack Developer & Frontend Specialist",
        avatar: "https://avatars.githubusercontent.com/u/101055521?v=4",
        specialization: ["React", "JavaScript", "CSS3", "HTML5", "Tailwind CSS", "UI/UX"],
        email: "alamin.dev@gmail.com",
        github: "https://github.com/alamin-dev",
        linkedin: "https://linkedin.com/in/alamin-dev",
        bio: "Frontend enthusiast with a keen eye for design and user experience. Specializes in creating responsive, accessible, and visually appealing web interfaces.",
        contributions: [
            "UI/UX Design Implementation",
            "Component Development",
            "Responsive Design",
            "Frontend Optimization",
            "User Interface Testing"
        ],
        favoriteTools: ["React", "Tailwind CSS", "JavaScript", "Figma", "CSS3"],
        experience: "2+ years"
    },
    {
        id: "4",
        name: "Sadiqual Hoque Sadib",
        role: "Frontend Developer & Testing Specialist",
        avatar: "https://avatars.githubusercontent.com/u/111662359?v=4",
        specialization: ["React", "JavaScript", "Testing", "Quality Assurance", "CSS3"],
        email: "sadib.dev@gmail.com",
        github: "https://github.com/sadib-dev",
        linkedin: "https://linkedin.com/in/sadib-dev",
        bio: "Detail-oriented frontend developer with a strong focus on code quality and testing. Ensures robust, bug-free user interfaces through comprehensive testing strategies.",
        contributions: [
            "Component Testing",
            "Quality Assurance",
            "Bug Detection & Fixing",
            "Code Review",
            "Performance Testing"
        ],
        favoriteTools: ["React", "Jest", "JavaScript", "ESLint", "Chrome DevTools"],
        experience: "2+ years"
    },
    {
        id: "5",
        name: "Motasim Billah Asik",
        role: "Frontend Developer & Documentation Lead",
        avatar: "https://avatars.githubusercontent.com/u/132875394?v=4",
        specialization: ["React", "JavaScript", "Documentation", "Git", "Project Management"],
        email: "motasim.dev@gmail.com",
        github: "https://github.com/motasim-dev",
        linkedin: "https://linkedin.com/in/motasim-dev",
        bio: "Frontend developer with excellent documentation skills and project management experience. Focuses on maintainable code and comprehensive project documentation.",
        contributions: [
            "Technical Documentation",
            "Code Documentation",
            "Project Planning",
            "Version Control Management",
            "Team Collaboration"
        ],
        favoriteTools: ["React", "Git", "Markdown", "Notion", "JavaScript"],
        experience: "2+ years"
    }
];

const DevelopersInfo = () => {
    const [selectedDev, setSelectedDev] = useState<Developer | null>(null);

    const projectStats = {
        totalCommits: "800+",
        linesOfCode: "25,000+",
        components: "50+",
        developmentTime: "4 months",
        technologies: 12,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Development Team
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Meet the developers who built the Smart Marks system.
                </p>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 max-w-3xl mx-auto">
                <div className="bg-white rounded p-3 text-center shadow-sm border">
                    <div className="text-xl font-semibold text-gray-900">{projectStats.totalCommits}</div>
                    <div className="text-xs text-gray-500">Commits</div>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm border">
                    <div className="text-xl font-semibold text-gray-900">{projectStats.linesOfCode}</div>
                    <div className="text-xs text-gray-500">Lines of Code</div>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm border">
                    <div className="text-xl font-semibold text-gray-900">{projectStats.components}</div>
                    <div className="text-xs text-gray-500">Components</div>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm border">
                    <div className="text-xl font-semibold text-gray-900">{projectStats.developmentTime}</div>
                    <div className="text-xs text-gray-500">Dev Time</div>
                </div>
                <div className="bg-white rounded p-3 text-center shadow-sm border">
                    <div className="text-xl font-semibold text-gray-900">{projectStats.technologies}</div>
                    <div className="text-xs text-gray-500">Technologies</div>
                </div>
            </div>

            {/* Developers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {developers.map((developer) => (
                    <div key={developer.id} className="h-full">
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200 h-full flex flex-col">
                            {/* Avatar */}
                            <div className="flex justify-center mb-4">
                                <img 
                                    src={developer.avatar} 
                                    alt={developer.name} 
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" 
                                />
                            </div>

                            {/* Info */}
                            <div className="text-center mb-4 flex-grow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{developer.name}</h3>
                                <p className="text-blue-600 text-sm font-medium mb-2">{developer.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{developer.bio}</p>
                            </div>

                            {/* Experience */}
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-xs text-gray-500">{developer.experience} experience</span>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap justify-center gap-1 mb-4">
                                {developer.specialization.slice(0, 3).map((skill) => (
                                    <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                                {developer.specialization.length > 3 && (
                                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                        +{developer.specialization.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 mt-auto">
                                <button 
                                    onClick={() => setSelectedDev(developer)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                    View Profile
                                </button>
                                
                                <div className="flex justify-center space-x-3">
                                    {developer.github && (
                                        <a 
                                            href={developer.github} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors"
                                            title={`${developer.name}'s GitHub`}
                                        >
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {developer.linkedin && (
                                        <a 
                                            href={developer.linkedin} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
                                            title={`${developer.name}'s LinkedIn`}
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    <a 
                                        href={`mailto:${developer.email}`}
                                        className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center hover:bg-gray-600 transition-colors"
                                        title={`Email ${developer.name}`}
                                    >
                                        <Mail className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Description */}
            <div className="mt-12 max-w-3xl mx-auto text-center">
                <div className="bg-white rounded p-6 shadow-sm border">
                    <div className="flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-gray-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">About Our Team</h2>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        A passionate team of developers who built the Smart Marks system. 
                        Our diverse backgrounds in full-stack development, testing, and documentation 
                        allow us to create robust, user-friendly educational technology solutions.
                    </p>
                </div>
            </div>

            {/* Developer Details Modal */}
            {selectedDev && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <img 
                                        src={selectedDev.avatar} 
                                        alt={selectedDev.name} 
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedDev.name}</h3>
                                        <p className="text-blue-600 text-sm">{selectedDev.role}</p>
                                        <p className="text-gray-500 text-xs">{selectedDev.experience} experience</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDev(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Bio */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{selectedDev.bio}</p>
                            </div>

                            {/* Specializations */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedDev.specialization.map((skill) => (
                                        <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Contributions */}
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Contributions</h4>
                                <ul className="space-y-1">
                                    {selectedDev.contributions.map((contribution, index) => (
                                        <li key={index} className="flex items-start text-gray-600 text-sm">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                            {contribution}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Connect</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        <a href={`mailto:${selectedDev.email}`} className="hover:text-blue-600">
                                            {selectedDev.email}
                                        </a>
                                    </div>
                                    <div className="flex space-x-2">
                                        {selectedDev.github && (
                                            <a
                                                href={selectedDev.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800 transition-colors"
                                            >
                                                <Github className="w-3 h-3 mr-1" />
                                                GitHub
                                            </a>
                                        )}
                                        {selectedDev.linkedin && (
                                            <a
                                                href={selectedDev.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                            >
                                                <Linkedin className="w-3 h-3 mr-1" />
                                                LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDev(null)}
                                className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DevelopersInfo;
