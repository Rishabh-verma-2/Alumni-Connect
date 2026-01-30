import React, { useState, useEffect } from 'react';
import { alumniAPI } from '../../api/api';
import { Mail, MapPin, Building, Calendar } from 'lucide-react';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await alumniAPI.getAllAlumni();
        setAlumni(response.data.data);
      } catch (error) {
        setError('Failed to fetch alumni data');
        console.error('Error fetching alumni:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Alumni Directory</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((alum) => (
            <div key={alum._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                {alum.profilePicture ? (
                  <img 
                    src={alum.profilePicture} 
                    alt={alum.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {alum.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{alum.name}</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">{alum.role}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{alum.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Class of {alum.yearOfPassing}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{alum.branch}</span>
                </div>
                
                {alum.currentCompany && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{alum.currentDesignation} at {alum.currentCompany}</span>
                  </div>
                )}
                
                {alum.currentLocation && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{alum.currentLocation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {alumni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No alumni found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniList;
