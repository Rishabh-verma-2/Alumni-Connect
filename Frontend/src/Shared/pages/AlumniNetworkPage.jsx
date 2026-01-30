import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, GraduationCap, ArrowRight, UserPlus, Users, Globe, Award } from 'lucide-react';

const AlumniNetworkPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data for Alumni
    const alumniList = [
        {
            id: 1,
            name: "Aditya Verma",
            role: "Senior SDE",
            company: "Amazon MS",
            location: "Bangalore, India",
            batch: "2019",
            image: "https://i.pravatar.cc/150?u=12",
            color: "from-orange-500 to-red-500"
        },
        {
            id: 2,
            name: "Sneha Reddy",
            role: "Product Manager",
            company: "Swiggy",
            location: "Hyderabad, India",
            batch: "2020",
            image: "https://i.pravatar.cc/150?u=23",
            color: "from-blue-500 to-cyan-500"
        },
        {
            id: 3,
            name: "Rohan Mehta",
            role: "Founder & CEO",
            company: "AgriTech Solutions",
            location: "Mumbai, India",
            batch: "2018",
            image: "https://i.pravatar.cc/150?u=34",
            color: "from-purple-500 to-pink-500"
        },
        {
            id: 4,
            name: "Priya Sharma",
            role: "Data Scientist",
            company: "Google",
            location: "London, UK",
            batch: "2021",
            image: "https://i.pravatar.cc/150?u=45",
            color: "from-green-500 to-teal-500"
        },
        {
            id: 5,
            name: "Vikram Singh",
            role: "Investment Banker",
            company: "J.P. Morgan",
            location: "New York, USA",
            batch: "2017",
            image: "https://i.pravatar.cc/150?u=56",
            color: "from-indigo-500 to-violet-500"
        },
        {
            id: 6,
            name: "Anjali Gupta",
            role: "UX Researcher",
            company: "Spotify",
            location: "Stockholm, Sweden",
            batch: "2022",
            image: "https://i.pravatar.cc/150?u=67",
            color: "from-yellow-500 to-orange-500"
        }
    ];

    const filteredAlumni = alumniList.filter(alumni =>
        alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-blue-500/30">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                {/* Animated Backgrounds */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium mb-6"
                    >
                        <Users className="w-4 h-4" /> Global Community of 10,000+
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                    >
                        Alumni <span className="text-blue-500">Network</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
                    >
                        Connect with graduates who are shaping industries worldwide. find mentors, explore opportunities, and grow your professional circle.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto relative"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-slate-800 rounded-2xl p-2 flex items-center border border-white/10 shadow-xl">
                                <Search className="w-6 h-6 text-slate-400 ml-3" />
                                <input
                                    type="text"
                                    placeholder="Search by name, company, or role..."
                                    className="w-full bg-transparent border-none focus:outline-none text-white px-4 py-2 placeholder:text-slate-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-12 border-y border-white/5 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Active Members", value: "12,500+", icon: <Users className="text-blue-400" /> },
                            { label: "Companies", value: "850+", icon: <Briefcase className="text-orange-400" /> },
                            { label: "Countries", value: "24", icon: <Globe className="text-green-400" /> },
                            { label: "Mentorships", value: "1,200+", icon: <Award className="text-purple-400" /> },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-2xl">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ALUMNI GRID --- */}
            <section className="py-24 px-4">
                <div className="container mx-auto">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {filteredAlumni.map((alumni, i) => (
                            <motion.div
                                key={alumni.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300"
                            >
                                {/* Header Gradient */}
                                <div className={`h-24 bg-gradient-to-r ${alumni.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

                                {/* Profile Image */}
                                <div className="absolute top-12 left-8">
                                    <div className="w-20 h-20 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-lg">
                                        <img src={alumni.image} alt={alumni.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="pt-16 p-8">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-white mb-1">{alumni.name}</h3>
                                        <p className="text-blue-400 font-medium">{alumni.role}</p>
                                        <p className="text-slate-400 text-sm">at {alumni.company}</p>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center text-sm text-slate-400">
                                            <MapPin className="w-4 h-4 mr-3 text-slate-600" />
                                            {alumni.location}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-400">
                                            <GraduationCap className="w-4 h-4 mr-3 text-slate-600" />
                                            Class of {alumni.batch}
                                        </div>
                                    </div>

                                    <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                                        <UserPlus className="w-4 h-4" /> Connect
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {filteredAlumni.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <p className="text-xl">No alumni found matching your search.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AlumniNetworkPage;
