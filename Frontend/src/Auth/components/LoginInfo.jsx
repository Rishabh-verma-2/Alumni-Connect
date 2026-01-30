import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { alumniAPI } from '../../api/api';
import { User, Mail, Shield, Calendar, Building, MapPin, CreditCard } from 'lucide-react';

const LoginInfo = () => {
  const { user } = useAuth();
  const [alumniData, setAlumniData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.role === 'alumni') {
        try {
          const response = await alumniAPI.getAllAlumni();
          const currentAlumni = response.data.data.find(alum => alum.email === user.email);
          setAlumniData(currentAlumni);
        } catch (error) {
          console.error('Error fetching alumni data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>;
  }

  const displayData = alumniData || user;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Login Information</h2>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {displayData?.name || user?.username || 'Not provided'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
            <p className="font-medium text-gray-900 dark:text-white">{displayData?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{displayData?.role}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Enrollment ID:</span>
            <p className="font-medium text-gray-900 dark:text-white">{alumniData?.enrollmentId || user?.enrollmentId || 'Not provided'}</p>
          </div>
        </div>
        
        {alumniData && (
          <>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Year of Passing:</span>
                <p className="font-medium text-gray-900 dark:text-white">{alumniData.yearOfPassing}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Branch:</span>
                <p className="font-medium text-gray-900 dark:text-white">{alumniData.branch}</p>
              </div>
            </div>
            
            {alumniData.currentCompany && (
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Company:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {alumniData.currentDesignation} at {alumniData.currentCompany}
                  </p>
                </div>
              </div>
            )}
            
            {alumniData.currentLocation && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{alumniData.currentLocation}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginInfo;