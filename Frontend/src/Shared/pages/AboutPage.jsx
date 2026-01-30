import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, Star, ArrowRight, ChevronDown,
  Globe, Zap, Sparkles, Target, Heart, Rocket,
  Linkedin, Twitter, Mail
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeFaq, setActiveFaq] = useState(null);

  // Parallax background elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Data
  const stats = [
    { label: "Active Alumni", value: "5000+", icon: <Users />, color: "from-blue-400 to-cyan-500" },
    { label: "Mentorships", value: "1200+", icon: <Briefcase />, color: "from-purple-400 to-pink-500" },
    { label: "Global Reach", value: "50+", icon: <Globe />, color: "from-green-400 to-emerald-500" },
    { label: "Success Stories", value: "800+", icon: <Star />, color: "from-orange-400 to-red-500" }
  ];

  const values = [
    { icon: <Heart />, title: 'Community First', desc: 'Building genuine relationships that last beyond graduation.', color: 'bg-red-500' },
    { icon: <Target />, title: 'Excellence', desc: 'Striving for the highest quality in every connection and opportunity.', color: 'bg-blue-500' },
    { icon: <Globe />, title: 'Inclusivity', desc: 'Creating opportunities for everyone, regardless of background.', color: 'bg-green-500' },
    { icon: <Zap />, title: 'Innovation', desc: 'Continuously evolving to meet the changing needs of our community.', color: 'bg-yellow-500' }
  ];

  const timeline = [
    { year: "2023", title: "The Inception", desc: "Started as a small student project to bridge the gap between seniors and juniors." },
    { year: "2024", title: "Platform Launch", desc: "Official launch with core features: Alumni directory and basic mentorship matching." },
    { year: "2025", title: "Global Expansion", desc: "Reached 50+ universities and introduced AI-powered career guidance tools." },
    { year: "Future", title: "The Next Step", desc: "Building the world's largest decentralized professional learning network." }
  ];

  const team = [
    { name: "Alex Morgan", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
    { name: "Sarah Chen", role: "Head of Community", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
    { name: "Marcus Johnson", role: "CTO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" }
  ];

  const faqs = [
    { q: "Who can join Alumni Connect?", a: "Alumni Connect is open to all verified graduates, current students, and faculty members of partner institutions." },
    { q: "Is the platform free?", a: "Yes! Basic networking and mentorship features are completely free. We believe in accessible education for all." },
    { q: "How does the mentorship matching work?", a: "Our AI algorithm analyzes your skills, interests, and career goals to suggest the most compatible mentors for you." }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-50 overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen" />
          <motion.div style={{ y: y2 }} className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 ring-1 ring-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm font-medium tracking-wide text-blue-200">Redefining Alumni Connections</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-tight">
              We Are <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Alumni Connect
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Bridging the gap between academic heritage and professional future.
              We are building the digital infrastructure for lifelong success.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl min-w-[200px] hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          style={{ opacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-slate-500">Scroll to explore</span>
          <ChevronDown className="animate-bounce w-5 h-5 text-slate-500" />
        </motion.div>
      </section>

      {/* --- MISSION & VISION --- */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Our Mission <span className="text-blue-500">&</span> Vision
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                We envision a world where every student has direct access to the wisdom of those who walked the path before them.
                Our mission is to democratize mentorship and professional networking, making it accessible, intuitive, and impactful.
              </p>

              <div className="space-y-6">
                {[
                  "Democratizing Access to Mentorship",
                  "Building Lifelong Professional Bonds",
                  "Accelerating Career Growth Globally"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xl text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-6">
              {[
                { title: "For Students", desc: "Unlock career guidance, resume reviews, and internship referrals from insiders.", icon: <Rocket className="w-6 h-6" />, color: "bg-blue-500" },
                { title: "For Alumni", desc: "Give back to your alma mater, find talent, and expand your own professional network.", icon: <Heart className="w-6 h-6" />, color: "bg-pink-500" }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 p-32 ${card.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`}></div>
                  <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-6`}>
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-slate-400">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- TIMELINE --- */}
      <section className="py-24 bg-slate-900/50 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Journey</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">From a dorm room idea to a global platform.</p>
          </motion.div>

          <div className="relative">
            {/* Line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent hidden md:block"></div>

            <div className="space-y-12 md:space-y-24">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="text-6xl font-black text-white/20 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{item.year}</div>
                    <h3 className="text-2xl font-bold text-blue-400 mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>

                  <div className="relative z-10 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-4 ring-slate-900"></div>

                  <div className="flex-1 hidden md:block"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES GRID --- */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Core Values
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-colors group"
              >
                <div className={`w-14 h-14 ${val.color} bg-opacity-20 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(val.icon, { className: "w-7 h-7" })}
                </div>
                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet The Minds</h2>
            <p className="text-slate-500">The passionate team behind the platform.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative group w-72"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
                  <div className="h-64 overflow-hidden relative">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                  </div>
                  <div className="p-6 text-center absolute bottom-0 left-0 right-0">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-blue-400 text-sm mb-4">{member.role}</p>
                    <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
                      <Linkedin className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                      <Twitter className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                      <Mail className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-lg">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-blue-900/50 border border-white/20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Join Us?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Start your journey today and become part of a global network of innovators and leaders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1"
              >
                Get Started Now
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Contact Support
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
