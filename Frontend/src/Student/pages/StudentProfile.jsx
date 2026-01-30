import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, MapPin, Edit, Save, X, Github, Linkedin, Twitter, Instagram, Facebook, Phone, UserCheck, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { studentAPI } from '../../api/api';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    user: { username: '', email: '', enrollmentId: '' },
    bio: '',
    yearOfJoining: '',
    yearOfPassing: '',
    branch: '',
    phoneNumber: '',
    interests: [],
    skills: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      facebook: ''
    },
    profilePicture: '',
    isVerified: false
  });

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await studentAPI.getProfile(user._id, token);

        setProfile({
          ...response.data,
          user: {
            username: user.name || user.username || 'User',
            email: user.email || '',
            enrollmentId: user.enrollmentId || ''
          }
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Set default values if profile doesn't exist
        setProfile(prev => ({
          ...prev,
          user: {
            username: user.name || user.username || 'User',
            email: user.email || '',
            enrollmentId: user.enrollmentId || ''
          }
        }));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  const [editForm, setEditForm] = useState({});

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      bio: profile.bio || '',
      yearOfJoining: profile.yearOfJoining || null,
      yearOfPassing: profile.yearOfPassing || null,
      branch: profile.branch || '',
      phoneNumber: profile.phoneNumber || '',
      interests: profile.interests || [],
      skills: profile.skills || [],
      socialLinks: profile.socialLinks || {
        linkedin: '',
        github: '',
        twitter: '',
        instagram: '',
        facebook: ''
      }
    });
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(profile.user.username);
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername('');
  };

  const handleUsernameSave = async () => {
    if (!newUsername.trim() || newUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
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
          user: { ...prev.user, username: updatedUsername }
        }));
        await refreshUser();
        setIsEditingUsername(false);
        toast.success('Username updated successfully');
      } else {
        toast.error(data.message || 'Failed to update username');
      }
    } catch {
      toast.error('Failed to update username');
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Saving with token:', token.substring(0, 20) + '...');
      console.log('User ID:', user._id);
      console.log('Edit form data:', editForm);

      const response = await fetch(`http://localhost:5001/api/v1/student/profile/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        // Token expired - need fresh login
        localStorage.removeItem('token');
        toast.error('Please login again to save changes to database');
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error:', response.status, errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Save successful:', data);

      // Update profile with backend response
      setProfile({
        ...data,
        user: {
          username: user.name || user.username || 'User',
          email: user.email || ''
        }
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');

    } catch (error) {
      console.error('Save failed:', error);

      // Fallback to local update
      setProfile({
        ...profile,
        ...editForm,
        user: {
          username: user.name || user.username || 'User',
          email: user.email || ''
        }
      });

      setIsEditing(false);
      toast.success('Profile updated locally');
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const addSkill = (skill) => {
    if (skill && !editForm.skills.includes(skill)) {
      setEditForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addInterest = (interest) => {
    if (interest && !editForm.interests.includes(interest)) {
      setEditForm(prev => ({ ...prev, interests: [...prev.interests, interest] }));
    }
  };

  const removeInterest = (interestToRemove) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return;
      }

      const response = await studentAPI.uploadProfileImage(user._id, formData, token);

      setProfile(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));

      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setImageUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} flex items-center justify-center`}>
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Hero Section */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

          {/* Header Actions - Moved here to prevent overlap */}
          <div className="absolute bottom-6 right-8 lg:right-12 hidden sm:block z-20">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-6 py-2.5 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-emerald-600 transition-all duration-200"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-white text-gray-700 font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 -mt-16 relative z-10 pb-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Profile Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 text-center">
                  <div className="relative inline-block mb-4 group">
                    <div className={`relative w-40 h-40 mx-auto rounded-full p-1 bg-white shadow-xl ${imageUploading ? 'animate-pulse' : ''}`}>
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        {profile.profilePicture ? (
                          <img
                            src={profile.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover transform transition hover:scale-105 duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-5xl">
                            {(() => {
                              const fullName = user?.name || user?.username || 'User Student';
                              const nameParts = fullName.split(' ');
                              if (nameParts.length >= 2) {
                                return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
                              }
                              return fullName.substring(0, 2).toUpperCase();
                            })()}
                          </div>
                        )}

                        {/* Overlay for Image Upload */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer" onClick={triggerImageUpload}>
                          <Camera className="text-white w-10 h-10" />
                        </div>

                        {imageUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="loading loading-spinner text-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={triggerImageUpload}
                      disabled={imageUploading}
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
                      title="Update Photo"
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Name & Role */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{profile.user.username}</h2>
                      {profile.isVerified && (
                        <div className="relative group">
                          <UserCheck className="w-5 h-5 text-blue-500" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Verified Student
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full text-sm">Student</p>
                  </div>

                  {/* Quick Stats / Info */}
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-left">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-sm text-gray-700 truncate" title={profile.user.email}>{profile.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                      <p className="text-sm text-gray-700">{profile.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Enrollment</p>
                      <p className="text-sm text-gray-700">{profile.user.enrollmentId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Branch</p>
                      <p className="text-sm text-gray-700 truncate" title={profile.branch}>{profile.branch || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-center space-x-4">
                      {[
                        { key: 'linkedin', icon: Linkedin, color: 'text-blue-700', hover: 'hover:bg-blue-50' },
                        { key: 'github', icon: Github, color: 'text-gray-900', hover: 'hover:bg-gray-50' },
                        { key: 'twitter', icon: Twitter, color: 'text-blue-400', hover: 'hover:bg-blue-50' },
                        { key: 'instagram', icon: Instagram, color: 'text-pink-600', hover: 'hover:bg-pink-50' },
                        { key: 'facebook', icon: Facebook, color: 'text-blue-600', hover: 'hover:bg-blue-50' },
                      ].map((social) => {
                        const link = profile.socialLinks[social.key];
                        if (!link && !isEditing) return null;

                        return (
                          <a
                            key={social.key}
                            href={isEditing ? '#' : link}
                            onClick={(e) => isEditing && e.preventDefault()}
                            className={`p-2 rounded-full transition-all duration-200 ${social.color} ${social.hover} ${!link && isEditing ? 'opacity-40 grayscale' : ''}`}
                          >
                            <social.icon size={22} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="mt-6 sm:hidden grid grid-cols-1 gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md"
                  >
                    <Edit size={18} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Details & Edit Forms */}
            <div className="lg:col-span-8 space-y-6">

              {/* Username Edit Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Display Name</h3>
                      <p className="text-sm text-gray-500">How you appear to others</p>
                    </div>
                  </div>
                  {!isEditingUsername && (
                    <button onClick={handleUsernameEdit} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition">
                      Change Login Name
                    </button>
                  )}
                </div>

                {isEditingUsername ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New Username</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="Enter new username"
                      />
                      <button
                        onClick={handleUsernameSave}
                        disabled={usernameLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {usernameLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleUsernameCancel}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-700 font-medium text-lg px-2">{profile.user.username}</div>
                )}
              </div>

              {/* About Me */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <User size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">About Me</h3>
                </div>

                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px] text-gray-700"
                    placeholder="Write a short bio about yourself..."
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {profile.bio || <span className="text-gray-400 italic">No bio added yet. Tell others about yourself!</span>}
                  </p>
                )}
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Academic Information</h3>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch / Major</label>
                      <input
                        type="text"
                        value={editForm.branch || ''}
                        onChange={(e) => handleInputChange('branch', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber || ''}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="+91 ..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Join Year</label>
                        <input
                          type="number"
                          value={editForm.yearOfJoining || ''}
                          onChange={(e) => handleInputChange('yearOfJoining', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="2022"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pass Year</label>
                        <input
                          type="number"
                          value={editForm.yearOfPassing || ''}
                          onChange={(e) => handleInputChange('yearOfPassing', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="2026"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex items-start space-x-3">
                      <MapPin className="mt-1 text-gray-400" size={18} />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Branch</p>
                        <p className="text-gray-900 font-semibold">{profile.branch || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="mt-1 text-gray-400" size={18} />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Academic Duration</p>
                        <p className="text-gray-900 font-semibold">
                          {profile.yearOfJoining && profile.yearOfPassing
                            ? `${profile.yearOfJoining} - ${profile.yearOfPassing}`
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="mt-1 text-gray-400" size={18} />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Contact</p>
                        <p className="text-gray-900 font-semibold">{profile.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills & Interests Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                    Skills
                  </h3>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editForm.skills : profile.skills).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${isEditing
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}
                        >
                          {skill}
                          {isEditing && (
                            <button onClick={() => removeSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      ))}
                      {(isEditing ? editForm.skills : profile.skills).length === 0 && !isEditing && (
                        <span className="text-gray-400 text-sm italic">No skills listed</span>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Type skill & press Enter"
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                    Interests
                  </h3>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editForm.interests : profile.interests).map((interest, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all ${isEditing
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                        >
                          {interest}
                          {isEditing && (
                            <button onClick={() => removeInterest(interest)} className="ml-2 text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      ))}
                      {(isEditing ? editForm.interests : profile.interests).length === 0 && !isEditing && (
                        <span className="text-gray-400 text-sm italic">No interests listed</span>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mt-4">
                        <input
                          type="text"
                          placeholder="Type interest & press Enter"
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addInterest(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links Editing (Only visible when editing) */}
              {isEditing && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Social Profiles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="text-blue-700" size={18} />
                      </div>
                      <input
                        type="url"
                        value={editForm.socialLinks.linkedin}
                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github className="text-gray-900" size={18} />
                      </div>
                      <input
                        type="url"
                        value={editForm.socialLinks.github}
                        onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="GitHub URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Twitter className="text-blue-400" size={18} />
                      </div>
                      <input
                        type="url"
                        value={editForm.socialLinks.twitter}
                        onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Instagram className="text-pink-600" size={18} />
                      </div>
                      <input
                        type="url"
                        value={editForm.socialLinks.instagram}
                        onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        placeholder="Instagram URL"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
