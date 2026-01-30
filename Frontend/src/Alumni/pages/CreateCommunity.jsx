import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { communityAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AlumniSidebar from '../components/AlumniSidebar';
import { useSidebar } from '../../context/SidebarContext';

const CreateCommunity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isSidebarCollapsed } = useSidebar() || { isSidebarCollapsed: false };

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Career',
        tags: '',
        visibility: 'public',
        icon: '👥',
        coverImage: '',
    });

    const [loading, setLoading] = useState(false);

    const categories = ['Career', 'Technical', 'College Background', 'Industry', 'Skills', 'Other'];
    const emojiOptions = ['👥', '💼', '💻', '🎓', '🚀', '🌟', '🔥', '⚡', '🎯', '🏆', '📚', '🌍'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Parse tags
            const tagsArray = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];

            const communityData = {
                ...formData,
                tags: tagsArray,
            };

            const response = await communityAPI.createCommunity(communityData, token);
            toast.success('Community created successfully!');
            navigate(`/communities/${response.data.data._id}`);
        } catch (error) {
            console.error('Error creating community:', error);
            toast.error(error.response?.data?.message || 'Failed to create community');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            <Sidebar />

            <div className={`relative z-10 flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/communities')}
                    className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Communities
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                        Create Micro-Community
                    </h1>
                    <p className="text-slate-500">Build a focused community around a specific interest or goal</p>
                </div>

                {/* Form */}
                <div className="max-w-3xl">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                        {/* Community Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Community Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                placeholder="e.g., Future AI Engineers, Non-CS to Tech Switch"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Choose a clear, engaging name that reflects your community's purpose</p>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                                rows="4"
                                placeholder="Describe what your community is about, who should join, and what value members will get..."
                                required
                            ></textarea>
                        </div>

                        {/* Category */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                placeholder="AI, Machine Learning, Career Switch (comma-separated)"
                            />
                            <p className="text-xs text-slate-500 mt-1">Add relevant tags to help people discover your community</p>
                        </div>

                        {/* Visibility */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-4">
                                Visibility
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="public"
                                        checked={formData.visibility === 'public'}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">Public</div>
                                        <div className="text-sm text-slate-600">Anyone can see and join this community</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={formData.visibility === 'private'}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">Private</div>
                                        <div className="text-sm text-slate-600">Visible to everyone, but requires approval to join</div>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="hidden"
                                        checked={formData.visibility === 'hidden'}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="font-bold text-slate-900">Hidden</div>
                                        <div className="text-sm text-slate-600">Only members can see this community (invite-only)</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Icon Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Community Icon
                            </label>
                            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                                {emojiOptions.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                                        className={`text-3xl p-3 rounded-xl border-2 transition-all hover:scale-110 ${formData.icon === emoji
                                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cover Image URL (Optional) */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Cover Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="text-xs text-slate-500 mt-1">Provide a URL to an image for the community cover</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Community'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/communities')}
                                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCommunity;
