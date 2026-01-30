import React, { useState } from 'react';
import Navbar from '../../Shared/components/Navbar.jsx';
import Footer from '../../Shared/components/Footer.jsx';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, User, AtSign, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Subject validation
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setIsSubmitting(false);
    };

    const contactInfo = [
        {
            icon: <Mail className="w-6 h-6" />,
            title: "Email Us",
            details: "support@alumniconnect.com",
            desc: "Our friendly team is here to help.",
            color: "from-blue-400 to-cyan-500"
        },
        {
            icon: <Phone className="w-6 h-6" />,
            title: "Call Us",
            details: "+1 (555) 000-0000",
            desc: "Mon-Fri from 8am to 5pm.",
            color: "from-purple-400 to-pink-500"
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: "Visit Us",
            details: "123 Innovation Dr, Tech City",
            desc: "Come say hello at our office HQ.",
            color: "from-orange-400 to-red-500"
        }
    ];

    // Helper input classes
    const getInputClass = (fieldName) => `
        w-full bg-slate-900/50 border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all text-white placeholder:text-slate-600
        ${errors[fieldName]
            ? 'border-red-500/50 focus:ring-red-500/20'
            : 'border-slate-700 focus:ring-blue-500/50'
        }
    `;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-blue-500/30">
            <Navbar />

            {/* --- HERO HEADER --- */}
            <section className="pt-32 pb-12 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none -translate-x-1/2"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                    >
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        Have questions about the platform? Want to partner with us?
                        We'd love to hear from you.
                    </motion.p>
                </div>
            </section>

            <section className="pb-24 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">

                        {/* --- CONTACT LEFTSIDE INFO --- */}
                        <div className="lg:col-span-1 space-y-6">
                            {contactInfo.map((info, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 + 0.3 }}
                                    className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl group hover:border-white/20 transition-all duration-300"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        {info.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{info.title}</h3>
                                    <p className="text-blue-400 font-medium mb-1">{info.details}</p>
                                    <p className="text-sm text-slate-500">{info.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* --- CONTACT FORM --- */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <MessageSquare className="text-blue-500" /> Send us a message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Your Name</label>
                                        <div className="relative">
                                            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.name ? 'text-red-400' : 'text-slate-500'}`} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={getInputClass('name')}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-xs ml-1 flex items-center gap-1"
                                            >
                                                <AlertCircle className="w-3 h-3" /> {errors.name}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                                        <div className="relative">
                                            <AtSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-slate-500'}`} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={getInputClass('email')}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-red-400 text-xs ml-1 flex items-center gap-1"
                                            >
                                                <AlertCircle className="w-3 h-3" /> {errors.email}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Subject</label>
                                    <div className="relative">
                                        <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.subject ? 'text-red-400' : 'text-slate-500'}`} />
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className={getInputClass('subject')}
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    {errors.subject && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs ml-1 flex items-center gap-1"
                                        >
                                            <AlertCircle className="w-3 h-3" /> {errors.subject}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Message</label>
                                    <div className="relative">
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="5"
                                            className={`w-full bg-slate-900/50 border rounded-xl py-4 px-4 focus:outline-none focus:ring-2 transition-all text-white placeholder:text-slate-600 resize-none ${errors.message ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-700 focus:ring-blue-500/50'}`}
                                            placeholder="Tell us more about your inquiry..."
                                        ></textarea>
                                    </div>
                                    {errors.message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs ml-1 flex items-center gap-1"
                                        >
                                            <AlertCircle className="w-3 h-3" /> {errors.message}
                                        </motion.p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="loading loading-spinner loading-md"></span>
                                    ) : (
                                        <>
                                            Send Message <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
