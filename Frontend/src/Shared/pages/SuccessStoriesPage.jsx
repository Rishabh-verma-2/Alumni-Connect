import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight, Play, Award, TrendingUp, Sparkles } from 'lucide-react';

const SuccessStoriesPage = () => {
    const stories = [
        {
            name: "Aditya Verma",
            role: "Senior SDE at Amazon",
            quote: "From campus projects to leading a team at Amazon, Alumni Connect provided the mentorship I needed to crack the interview.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            category: "Tech Giant",
            year: "2019"
        },
        {
            name: "Rohan Mehta",
            role: "Founder of AgriTech",
            quote: "I met my co-founder through an alumni networking event. Today, we're helping 50k+ farmers across India.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
            category: "Entrepreneurship",
            year: "2018"
        },
        {
            name: "Sneha Reddy",
            role: "Product Manager at Swiggy",
            quote: "The career insights webinar gave me clarity on switching from engineering to product management.",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
            category: "Product",
            year: "2020"
        },
        {
            name: "Vikram Singh",
            role: "Investment Banker at JP Morgan",
            quote: "Navigating the world of finance was tough, but alumni referrals opened doors that were otherwise closed.",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
            category: "Finance",
            year: "2017"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-orange-500/30">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="pt-32 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium mb-6"
                        >
                            <Sparkles className="w-4 h-4" /> Inspiring Journeys
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
                        >
                            Success Stories that <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                                Inspire Change
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto"
                        >
                            Read how our alumni are making waves across industries, founding startups, and leading global innovations.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* --- FEATURED VIDEO STORY --- */}
            <section className="pb-24 px-4">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl max-w-6xl mx-auto"
                    >
                        <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
                            alt="Group of alumni"
                            className="w-full h-[500px] object-cover"
                        />
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 cursor-pointer hover:scale-110 transition-transform group border border-white/20">
                                <Play className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Annual Alumni Meet 2025</h2>
                            <p className="text-lg text-slate-200 max-w-xl">Watch highlights from our biggest gathering yet, featuring keynotes, networking, and celebration.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STORIES GRID --- */}
            <section className="pb-32 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {stories.map((story, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={`group relative rounded-[2.5rem] overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-orange-500/30 transition-all duration-500 ${index % 2 === 1 ? 'md:translate-y-12' : ''}`}
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                                    <img
                                        src={story.image}
                                        alt={story.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-white flex items-center gap-2">
                                        <Award className="w-4 h-4 text-orange-400" />
                                        {story.category}
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 relative">
                                    <Quote className="w-10 h-10 text-orange-500/20 absolute top-8 right-8 rotate-12" />

                                    <h3 className="text-2xl font-bold text-white mb-2">{story.name}</h3>
                                    <p className="text-orange-400 font-medium mb-6 flex items-center gap-2">
                                        {story.role}
                                        <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                                        Class of {story.year}
                                    </p>

                                    <p className="text-slate-300 text-lg leading-relaxed mb-8 relative z-10">
                                        "{story.quote}"
                                    </p>

                                    <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform cursor-pointer">
                                        Read Full Story <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default SuccessStoriesPage;
