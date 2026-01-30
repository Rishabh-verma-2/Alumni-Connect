import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Plus, Search, Sun, Moon, Image, Video, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../../context/ThemeContext';

const EventsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const { theme, toggleTheme } = useTheme();

  const events = [
    {
      id: 1,
      title: 'Alumni Networking Night',
      date: '2024-02-15',
      time: '18:00',
      location: 'University Hall',
      type: 'networking',
      attendees: 45,
      maxAttendees: 100,
      description: 'Connect with alumni from various industries and expand your professional network.',
      organizer: 'Alumni Association',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Tech Career Workshop',
      date: '2024-02-20',
      time: '14:00',
      location: 'Online',
      type: 'workshop',
      attendees: 78,
      maxAttendees: 150,
      description: 'Learn about the latest trends in technology and career opportunities.',
      organizer: 'CS Department',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Annual Alumni Gala',
      date: '2024-03-10',
      time: '19:00',
      location: 'Grand Ballroom',
      type: 'social',
      attendees: 120,
      maxAttendees: 200,
      description: 'Celebrate achievements and reconnect with fellow alumni.',
      organizer: 'Alumni Association',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Entrepreneurship Seminar',
      date: '2024-02-25',
      time: '10:00',
      location: 'Business Center',
      type: 'seminar',
      attendees: 35,
      maxAttendees: 80,
      description: 'Learn from successful alumni entrepreneurs about starting your own business.',
      organizer: 'Business School',
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Alumni Career Fair 2023',
      date: '2023-11-15',
      time: '10:00',
      location: 'Main Campus',
      type: 'networking',
      attendees: 180,
      maxAttendees: 200,
      description: 'Major career fair connecting students with top employers.',
      organizer: 'Career Services',
      status: 'past',
      photos: 15,
      videos: 3,
      rating: 4.8,
      highlights: ['50+ companies participated', '150+ job offers', 'Record attendance']
    },
    {
      id: 6,
      title: 'Tech Innovation Summit',
      date: '2023-10-20',
      time: '09:00',
      location: 'Tech Hub',
      type: 'workshop',
      attendees: 110,
      maxAttendees: 120,
      description: 'Exploring cutting-edge technologies and innovation trends.',
      organizer: 'Engineering Department',
      status: 'past',
      photos: 25,
      videos: 5,
      rating: 4.9,
      highlights: ['AI & ML workshops', 'Startup pitches', 'Industry leaders']
    },
    {
      id: 7,
      title: 'Homecoming Celebration',
      date: '2023-09-30',
      time: '17:00',
      location: 'Stadium',
      type: 'social',
      attendees: 450,
      maxAttendees: 500,
      description: 'Annual homecoming celebration with alumni and students.',
      organizer: 'Alumni Association',
      status: 'past',
      photos: 40,
      videos: 8,
      rating: 4.7,
      highlights: ['500+ attendees', 'Live performances', 'Alumni awards ceremony']
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesTab = event.status === activeTab;
    return matchesSearch && matchesType && matchesTab;
  });

  const getEventTypeColor = (type) => {
    const colors = {
      networking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      workshop: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      social: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      seminar: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Events</h1>
            <p className="text-gray-600 dark:text-gray-400">Discover and join alumni events</p>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'past'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="networking">Networking</option>
              <option value="workshop">Workshop</option>
              <option value="social">Social</option>
              <option value="seminar">Seminar</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Plus size={16} className="mr-2" />
              Create Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Event Header */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getEventTypeColor(event.type)}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(event.date)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
                </div>
              </div>

              {/* Event Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
              
              {/* Event Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} className="mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Users size={14} className="mr-2" />
                  {event.attendees}/{event.maxAttendees} attendees
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={14} className="mr-2" />
                  Organized by {event.organizer}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Registration</span>
                  <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons or Past Event Info */}
              {event.status === 'upcoming' ? (
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Register
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
                    Details
                  </button>
                </div>
              ) : (
                <div>
                  {/* Media and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Image size={14} className="mr-1" />
                        {event.photos} photos
                      </div>
                      <div className="flex items-center">
                        <Video size={14} className="mr-1" />
                        {event.videos} videos
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{event.rating}</span>
                    </div>
                  </div>
                  
                  {/* Highlights */}
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Highlights:</h4>
                    <div className="flex flex-wrap gap-1">
                      {event.highlights.map((highlight, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link to={`/events/gallery/${event.id}`} className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium text-center">
                    View Gallery
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
