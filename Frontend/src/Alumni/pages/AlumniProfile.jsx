/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Briefcase, Calendar, Award, Linkedin, Github, Twitter, Instagram, Facebook, Edit3, Save, X } from 'lucide-react';
import AlumniSidebar from '../components/AlumniSidebar';
import AlumniProfileForm from '../components/AlumniProfileForm';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { alumniAPI } from '../../api/api';
import toast from 'react-hot-toast';

const AlumniProfile = () => {
  const { user, refreshUser } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    user: { name: '', email: '', enrollmentId: '' },
    yearOfPassing: '',
    branch: '',
    currentCompany: '',
    currentDesignation: '',
    currentLocation: '',
    profilePicture: '',
    achievements: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alumniId, setAlumniId] = useState(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.email);
      const token = localStorage.getItem('token');
      const response = await alumniAPI.getAllAlumni(token);
      console.log('API Response:', response.data);
      const currentAlumni = response.data.data.find(alum => alum.email === user.email);
      console.log('Found alumni:', currentAlumni);
      
      if (currentAlumni) {
        setAlumniId(currentAlumni._id);
        setProfile({
          user: {
            name: currentAlumni.name || user?.name || user?.username || 'Alumni User',
            email: currentAlumni.email || user?.email || '',
            enrollmentId: currentAlumni.enrollmentId || user?.enrollmentId || ''
          },
          yearOfPassing: currentAlumni.yearOfPassing || '',
          branch: currentAlumni.branch || '',
          currentCompany: currentAlumni.currentCompany || '',
          currentDesignation: currentAlumni.currentDesignation || '',
          currentLocation: currentAlumni.currentLocation || '',
          profilePicture: currentAlumni.profilePicture || '',
          achievements: currentAlumni.achievements || '',
          socialLinks: {
            linkedin: currentAlumni.socialLinks?.linkedin || '',
            github: currentAlumni.socialLinks?.github || '',
            twitter: currentAlumni.socialLinks?.twitter || '',
            instagram: currentAlumni.socialLinks?.instagram || '',
            facebook: currentAlumni.socialLinks?.facebook || ''
          }
        });
      } else {
        setProfile({
          user: {
            name: user?.name || user?.username || 'Alumni User',
            email: user?.email || '',
            enrollmentId: user?.enrollmentId || ''
          },
          yearOfPassing: '',
          branch: '',
          currentCompany: '',
          currentDesignation: '',
          currentLocation: '',
          profilePicture: '',
          achievements: '',
          socialLinks: {
            linkedin: '',
            github: '',
            twitter: '',
            instagram: '',
            facebook: ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load profile data');
      setProfile({
        user: {
          name: user?.name || user?.username || 'Alumni User',
          email: user?.email || '',
          enrollmentId: user?.enrollmentId || ''
        },
        yearOfPassing: '',
        branch: '',
        currentCompany: '',
        currentDesignation: '',
        currentLocation: '',
        profilePicture: '',
        achievements: '',
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: '',
          facebook: ''
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setProfile(prev => {
        const updated = {
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [socialField]: value
          }
        };
        console.log('Updated social links:', updated.socialLinks); // Debug log
        return updated;
      });
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        yearOfPassing: profile.yearOfPassing,
        branch: profile.branch,
        currentCompany: profile.currentCompany,
        currentDesignation: profile.currentDesignation,
        currentLocation: profile.currentLocation,
        achievements: profile.achievements,
        socialLinks: profile.socialLinks,
        isVerified: true
      };
      console.log('Saving data:', updateData); // Debug log
      
      // Refresh profile after save to get updated data
      setTimeout(() => {
        fetchProfile();
      }, 500);
      
      if (!alumniId) {
        const createData = {
          ...updateData,
          user: user._id,
          isVerified: true
        };
        const response = await fetch('http://localhost:5001/api/v1/alumni', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(createData)
        });
        
        if (!response.ok) throw new Error('Failed to create profile');
        const newAlumni = await response.json();
        setAlumniId(newAlumni.data._id);
      } else {
        await alumniAPI.updateProfile(alumniId, updateData, token);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(profile.user.name);
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername('');
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    setUsernameLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/v1/user/update-username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        const updatedUsername = newUsername.trim();
        setProfile(prev => ({
          ...prev,
          user: { ...prev.user, name: updatedUsername }
        }));
        await refreshUser();
        setIsEditingUsername(false);
        toast.success('Name updated successfully');
      } else {
        toast.error(data.message || 'Failed to update name');
      }
    } catch {
      toast.error('Failed to update name');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      toast.loading('Uploading image...');
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5001/api/v1/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        const imageUrl = data.imageUrl;
        setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
        
        const updateData = { profilePicture: imageUrl };
        
        if (!alumniId) {
          const createData = {
            ...updateData,
            user: user._id,
            isVerified: true
          };
          const createResponse = await fetch('http://localhost:5001/api/v1/alumni', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(createData)
          });
          
          if (createResponse.ok) {
            const newAlumni = await createResponse.json();
            setAlumniId(newAlumni.data._id);
          }
        } else {
          await alumniAPI.updateProfile(alumniId, updateData, token);
        }
        
        toast.dismiss();
        toast.success('Profile picture updated!');
      } else {
        toast.dismiss();
        toast.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload image');
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-x-hidden">
      <AlumniSidebar />
      
      {/* Main Content - Responsive padding and margin */}
      <div className={`flex-1 p-3 sm:p-4 lg:p-6 ml-0 transition-all duration-300 w-full max-w-full overflow-x-hidden responsive-container ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Header - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Alumni Profile</h1>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm sm:text-base"
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center text-sm sm:text-base"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm sm:text-base"
              >
                <Edit3 size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
          {/* Profile Card - Full width on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 order-1 xl:order-1 w-full max-w-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 w-full">
              <div className="text-center mb-4 sm:mb-6">
                <div className="relative inline-block">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-white font-bold text-2xl sm:text-4xl">
                        {profile.user.name ? profile.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-purple-700 shadow-lg transition-all duration-200 hover:scale-110"
                    title="Upload profile picture"
                  >
                    <Camera size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-3 sm:mt-4 break-words">{profile.user.name}</h2>
                <p className="text-purple-600 font-medium text-sm sm:text-base break-words">{profile.currentDesignation}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base break-words">{profile.currentCompany}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm break-all">Email: {profile.user.email}</p>
                <p className="text-xs sm:text-sm text-gray-500">Enrollment: {profile.user.enrollmentId}</p>
                <span className="inline-block px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium mt-2">
                  Alumni
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <Calendar size={14} className="mr-2 sm:mr-3 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="break-words">Class of {profile.yearOfPassing}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <Award size={14} className="mr-2 sm:mr-3 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="break-words">{profile.branch}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <MapPin size={14} className="mr-2 sm:mr-3 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="break-words">{profile.currentLocation || 'Location not set'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  <Briefcase size={14} className="mr-2 sm:mr-3 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="break-words">Enrollment: {profile.user.enrollmentId}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Social Links</h3>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 p-1">
                      <Linkedin size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900 p-1">
                      <Github size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 p-1">
                      <Twitter size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 p-1">
                      <Instagram size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:text-blue-900 p-1">
                      <Facebook size={18} className="sm:w-5 sm:h-5" />
                    </a>
                  )}
                </div>
                {(!profile.socialLinks || Object.values(profile.socialLinks).every(link => !link)) && (
                  <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">No social links added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form - Takes remaining space */}
          <AlumniProfileForm
            profile={profile}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            isEditingUsername={isEditingUsername}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
            handleUsernameEdit={handleUsernameEdit}
            handleUsernameSave={handleUsernameSave}
            handleUsernameCancel={handleUsernameCancel}
            usernameLoading={usernameLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
