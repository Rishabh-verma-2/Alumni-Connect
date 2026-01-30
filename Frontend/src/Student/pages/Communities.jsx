import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Users, Lock, Globe, Eye, TrendingUp, Filter, X, Plus, ArrowRight
} from 'lucide-react';
import { communityAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import StudentSidebar from '../components/Sidebar';
import AlumniSidebar from '../../Alumni/components/AlumniSidebar';
import { useSidebar } from '../../context/SidebarContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommunityCard from '../components/CommunityCard';

const Communities = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isSidebarCollapsed } = useSidebar() || { isSidebarCollapsed: false };

    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [view, setView] = useState('discover'); // 'discover' or 'my'

    const categories = ['All', 'Career', 'Technical', 'College Background', 'Industry', 'Skills', 'Other'];

    useEffect(() => {
        fetchCommunities();
        if (user) {
            fetchMyCommunities();
        }
    }, [user]);

    const fetchCommunities = async () => {
        try {
            const token = localStorage.getItem('token');
            const filters = {};
            if (selectedCategory && selectedCategory !== 'All') {
                filters.category = selectedCategory;
            }
            if (searchTerm) {
                filters.search = searchTerm;
            }

            const response = await communityAPI.getAllCommunities(filters, token);
            setCommunities(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching communities:', error);
            toast.error('Failed to load communities');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyCommunities = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await communityAPI.getUserCommunities(user._id, token);
            setMyCommunities(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching my communities:', error);
        }
    };

    const handleSearch = () => {
        fetchCommunities();
    };

    const handleJoinCommunity = async (communityId) => {
        try {
            const token = localStorage.getItem('token');
            await communityAPI.joinCommunity(communityId, token);
            toast.success('Successfully joined community!');
            fetchCommunities();
            fetchMyCommunities();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to join community';
            toast.error(message);
        }
    };

    const getVisibilityIcon = (visibility) => {
        switch (visibility) {
            case 'public':
                return <Globe size={16} className="text-green-500" />;
            case 'private':
                return <Lock size={16} className="text-yellow-500" />;
            case 'hidden':
                return <Eye size={16} className="text-gray-500" />;
            default:
                return <Globe size={16} />;
        }
    };

    const filteredCommunities = view === 'my' ? myCommunities : communities;

    return (
        <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            {user?.role === 'alumni' ? <AlumniSidebar /> : <StudentSidebar />}

            <div className={`relative z-10 flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                                Micro-Communities
                            </h1>
                            <p className="text-slate-500">Join intimate groups focused on specific interests and goals</p>
                        </div>
                        {user?.role === 'alumni' && (
                            <Link
                                to="/communities/create"
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Create Community
                            </Link>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setView('discover')}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'discover'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            Discover
                        </button>
                        <button
                            onClick={() => setView('my')}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'my'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            My Communities ({myCommunities.length})
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    placeholder="Search communities..."
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 overflow-x-auto">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category === 'All' ? '' : category);
                                            setTimeout(fetchCommunities, 100);
                                        }}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedCategory === (category === 'All' ? '' : category)
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSearch}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Communities Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                                <Skeleton height={128} className="mb-0" />
                                <div className="p-5">
                                    <Skeleton height={24} className="mb-3" width="80%" />
                                    <Skeleton count={2} className="mb-4" />
                                    <div className="flex gap-2 mb-4">
                                        <Skeleton width={60} height={24} borderRadius={12} />
                                        <Skeleton width={80} height={24} borderRadius={12} />
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <Skeleton width={100} />
                                        <Skeleton width={80} height={36} borderRadius={8} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.map((community) => (
                            <CommunityCard
                                key={community._id}
                                community={community}
                                onJoin={handleJoinCommunity}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No communities found</h3>
                        <p className="text-slate-500 mb-6">
                            {view === 'my'
                                ? "You haven't joined any communities yet"
                                : "Try adjusting your search or filters"
                            }
                        </p>
                        {view === 'my' && (
                            <button
                                onClick={() => setView('discover')}
                                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
                            >
                                Discover Communities
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Communities;
