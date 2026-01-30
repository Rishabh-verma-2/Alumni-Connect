import React, { useState } from 'react';
import { ArrowLeft, Image, Video, Download, Share2, Heart, MessageCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const EventGallery = () => {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState('photos');

  // Sample gallery data
  const galleryData = {
    5: {
      title: 'Alumni Career Fair 2023',
      photos: [
        { id: 1, url: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Career+Fair+1', likes: 24, comments: 5 },
        { id: 2, url: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Career+Fair+2', likes: 18, comments: 3 },
        { id: 3, url: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Career+Fair+3', likes: 32, comments: 8 },
        { id: 4, url: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Career+Fair+4', likes: 15, comments: 2 },
        { id: 5, url: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Career+Fair+5', likes: 27, comments: 6 },
        { id: 6, url: 'https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=Career+Fair+6', likes: 21, comments: 4 }
      ],
      videos: [
        { id: 1, thumbnail: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Video+1', title: 'Opening Ceremony', duration: '5:32', likes: 45, comments: 12 },
        { id: 2, thumbnail: 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Video+2', title: 'Company Presentations', duration: '12:45', likes: 38, comments: 9 },
        { id: 3, thumbnail: 'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Video+3', title: 'Student Interviews', duration: '8:20', likes: 29, comments: 7 }
      ]
    },
    6: {
      title: 'Tech Innovation Summit',
      photos: [
        { id: 1, url: 'https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=Tech+Summit+1', likes: 35, comments: 8 },
        { id: 2, url: 'https://via.placeholder.com/400x300/BE185D/FFFFFF?text=Tech+Summit+2', likes: 42, comments: 12 },
        { id: 3, url: 'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Tech+Summit+3', likes: 28, comments: 5 }
      ],
      videos: [
        { id: 1, thumbnail: 'https://via.placeholder.com/400x300/B91C1C/FFFFFF?text=AI+Workshop', title: 'AI Workshop Highlights', duration: '15:30', likes: 67, comments: 18 },
        { id: 2, thumbnail: 'https://via.placeholder.com/400x300/047857/FFFFFF?text=Startup+Pitch', title: 'Startup Pitch Session', duration: '22:15', likes: 54, comments: 15 }
      ]
    }
  };

  const currentEvent = galleryData[eventId] || galleryData[5];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to="/events" className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentEvent.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Event Gallery</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                activeTab === 'photos'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Image size={16} className="mr-2" />
              Photos ({currentEvent.photos.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                activeTab === 'videos'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Video size={16} className="mr-2" />
              Videos ({currentEvent.videos.length})
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        {activeTab === 'photos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentEvent.photos.map((photo) => (
              <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative group">
                  <img 
                    src={photo.url} 
                    alt={`Event photo ${photo.id}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Download size={16} className="text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Share2 size={16} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        {photo.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        {photo.comments}
                      </div>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                      View Full
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentEvent.videos.map((video) => (
              <div key={video.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative group">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button className="p-4 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
                      <Video size={24} className="text-gray-700 ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        {video.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        {video.comments}
                      </div>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventGallery;
