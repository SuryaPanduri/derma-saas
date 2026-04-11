import React from 'react';

export const ExperienceCard: React.FC = () => {
    return (
        <div className="bg-ivory min-h-screen p-8 flex items-center justify-center font-['Manrope']">
            <section className="max-w-3xl w-full relative overflow-hidden rounded-[2rem] border border-[#e6dfd3] bg-[#FAF8F4]/80 backdrop-blur-md shadow-glass p-10 md:p-16 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
                {/* Subtle Background Accent */}
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#8A6F5F]/5 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#D4C8BC]/5 blur-3xl" />

                <div className="relative space-y-8">
                    {/* Header Section */}
                    <header className="space-y-3">
                        <p className="font-['Assistant'] text-xs font-bold uppercase tracking-[0.2em] text-[#8A6F5F] [text-shadow:0_1px_1px_rgba(255,255,255,0.5)]">
                            Full Stack Developer (React & Firebase)
                        </p>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
                            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-semibold tracking-tight text-[#191919]">
                                Project I
                            </h2>
                            <p className="font-['Assistant'] text-sm font-medium text-[#8A6F5F]/60 mb-1">
                                JAN 2025 – Present
                            </p>
                        </div>
                    </header>

                    {/* Project Identity */}
                    <div className="space-y-4">
                        <h3 className="font-['Playfair_Display'] text-2xl md:text-3xl font-medium text-[#191919] leading-tight">
                            DERMA SAAS: <span className="text-[#8A6F5F]">Dermatology Clinic management & patient engagement platform</span>
                        </h3>

                        <div className="h-px w-full bg-gradient-to-r from-[#8A6F5F]/20 via-[#D4C8BC]/10 to-transparent" />
                    </div>

                    {/* Key Contributions List */}
                    <ul className="space-y-5">
                        {[
                            "Designed and developed a production-ready SaaS platform to streamline dermatology clinic operations, patient bookings, and medical service management.",
                            "Implemented a secure role-based access control (RBAC) system for Admins and Customers using Firebase Authentication and custom security rules.",
                            "Built a modular service-oriented architecture to handle clinic analytics, appointment slot management, and service catalogs with high scalability.",
                            "Created a premium, responsive dashboard and patient booking flow using React, TypeScript, and TailwindCSS, with real-time state management via Zustand and TanStack Query."
                        ].map((item, idx) => (
                            <li key={idx} className="flex gap-4 group">
                                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8A6F5F] group-hover:scale-150 transition-transform duration-300" />
                                <p className="font-['Assistant'] text-base md:text-lg leading-relaxed text-[#8A6F5F]/80 group-hover:text-[#191919] transition-colors duration-300">
                                    {item}
                                </p>
                            </li>
                        ))}
                    </ul>

                    {/* Footer Actions */}
                    <footer className="pt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#8A6F5F]/20 bg-[#FAF8F4]/50 text-[#8A6F5F] text-sm font-semibold">
                            <span className="h-2 w-2 rounded-full bg-[#8A6F5F] animate-pulse" />
                            Deployment: Live Demo
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4C8BC]/20 bg-white text-[#8A6F5F] text-sm font-semibold">
                            Code: GitHub
                        </div>
                    </footer>
                </div>
            </section>
        </div>
    );
};
