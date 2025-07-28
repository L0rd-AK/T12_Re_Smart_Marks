import { useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";

interface Developer {
    name: string;
    role: string;
    avatar: string;
    specialization: string[];
    email: string;
    github?: string;
    linkedin?: string;
}

const developers: Developer[] = [
    {
        name: "Mehedi Hasan",
        role: "Full Stack Developer",
        avatar: "MH",
        specialization: ["Next.js", "Tailwind", "React", "Node.js", "Expression.js", "Mongoose", "MongoDB", "Prisma", "PostgreSQL"],
        email: "mehedihasan.dev@example.com",
        github: "https://github.com/mehedihasan444",
        linkedin: "https://linkedin.com/in/mehedihasan",
    },

    {
        name: "Amit Kumar Ghosh",
        role: "Full Stack Developer",
        avatar: "NR",
        specialization: ["Next.js", "Tailwind", "React", "Node.js", "Expression.js", "MongoDB", "Mongoose", "Node.js", "MongoDB"],
        email: "naimur.backend@example.com",
        github: "https://github.com/naimurdev",
        linkedin: "https://linkedin.com/in/naimur",
    },
    {
        name: "Al Amin",
        role: "Full Stack Developer",
        avatar: "NR",
        specialization: ["Next.js", "Tailwind", "React", "Expression.js", "Mongoose", "Node.js", "MongoDB", "Prisma", "PostgreSQL"],
        email: "naimur.backend@example.com",
        github: "https://github.com/naimurdev",
        linkedin: "https://linkedin.com/in/naimur",
    },
    {
        name: "Sadiqual Hoque Sadib",
        role: "Frontend Developer",
        avatar: "NR",
        specialization: ["React.js", "Tailwind", "React", "Node.js", "Expression.js",  "Node.js", "MongoDB"],
        email: "naimur.backend@example.com",
        github: "https://github.com/naimurdev",
        linkedin: "https://linkedin.com/in/naimur",
    },
    {
        name: "Motasim Billah Asik",
        role: "Frontend Developer",
        avatar: "NR",
        specialization: ["React.js", "Tailwind", "React", "Node.js", "Expression.js",  "Node.js", "MongoDB"],
        email: "naimur.backend@example.com",
        github: "https://github.com/naimurdev",
        linkedin: "https://linkedin.com/in/naimur",
    },
];

const DevelopersInfo = () => {
    const [selectedDev, setSelectedDev] = useState<Developer | null>(null);

    return (
        <div className="  bg-white p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {developers.map((developer) => (
                    <div key={developer.name} className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="avatar placeholder">
                                <div className="bg-neutral-focus text-neutral-content rounded-full w-16">
                                    <span className="text-xl">{developer.avatar}</span>
                                </div>
                            </div>
                            <h2 className="card-title">{developer.name}</h2>
                            <p className="text-sm text-gray-500">{developer.role}</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {developer.specialization.map((skill) => (
                                    <div key={skill} className="badge badge-outline capitalize">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                            <div className="card-actions mt-4">
                                <button className="btn btn-sm btn-outline" onClick={() => setSelectedDev(developer)}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedDev && (
                <dialog id="dev_modal" className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">{selectedDev.name}</h3>
                        <p className="text-sm text-gray-500">{selectedDev.role}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedDev.specialization.map((tech) => (
                                <div key={tech} className="badge badge-info text-white">{tech}</div>
                            ))}
                        </div>

                        <div className="mt-4 space-y-2">
                            <p className="text-sm">
                                <Mail className="inline w-4 h-4 mr-1" />
                                {selectedDev.email}
                            </p>
                            <div className="flex gap-2">
                                {selectedDev.github && (
                                    <a href={selectedDev.github} target="_blank" className="btn btn-sm btn-outline">
                                        <Github className="w-4 h-4" />
                                    </a>
                                )}
                                {selectedDev.linkedin && (
                                    <a href={selectedDev.linkedin} target="_blank" className="btn btn-sm btn-outline">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="modal-action">
                            <form method="dialog">
                                <button className="btn" onClick={() => setSelectedDev(null)}>Close</button>
                            </form>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
export default DevelopersInfo;