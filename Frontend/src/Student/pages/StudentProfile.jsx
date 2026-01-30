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
        <div className={`flex-1 p-6 transition-all duration-300 flex items-center justify-center ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="relative">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg">
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
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={triggerImageUpload}
                    disabled={imageUploading}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-lg transition-all duration-200 hover:scale-110"
                    title="Upload profile picture"
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
                <h2 className="text-2xl font-bold text-gray-900">{profile.user.username}</h2>
                <p className="text-gray-600">Email: {profile.user.email}</p>
                <p className="text-sm text-gray-500">Enrollment No: {profile.user.enrollmentId || 'Not set'}</p>
                <div className="flex items-center justify-center text-gray-500">
                  <Phone size={16} className="mr-2" />
                  <span className="text-sm">{profile.phoneNumber || 'Phone not set'}</span>
                </div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mt-2">
                  Student
                </span>
              </div>

              {/* Academic Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">
                    {profile.yearOfJoining && profile.yearOfPassing 
                      ? `${profile.yearOfJoining} - ${profile.yearOfPassing}`
                      : 'Academic years not set'
                    }
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{profile.branch || 'Branch not set'}</span>
                </div>
                {profile.isVerified && (
                  <div className="flex items-center text-green-600">
                    <span className="text-sm font-medium">✓ Verified Student</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Social Links</h3>
                <div className="flex space-x-3">
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile.socialLinks.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                      <Github size={20} />
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                      <Twitter size={20} />
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                      <Instagram size={20} />
                    </a>
                  )}
                  {profile.socialLinks.facebook && (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                      <Facebook size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Username Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <UserCheck className="mr-2" size={20} />
                  Username
                </h3>
                {!isEditingUsername && (
                  <button
                    onClick={handleUsernameEdit}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              {isEditingUsername ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new username"
                    minLength={3}
                  />
                  <button
                    onClick={handleUsernameSave}
                    disabled={usernameLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                  >
                    <Save size={16} />
                    <span>{usernameLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleUsernameCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-1"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-lg">{profile.user.username}</p>
                  <span className="text-sm text-gray-500">This is how others will see you</span>
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600">{profile.bio || 'No bio added yet.'}</p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editForm.skills : profile.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Add skill..."
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Academic Info Section */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Joining</label>
                    <input
                      type="number"
                      value={editForm.yearOfJoining || ''}
                      onChange={(e) => handleInputChange('yearOfJoining', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2021"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing</label>
                    <input
                      type="number"
                      value={editForm.yearOfPassing || ''}
                      onChange={(e) => handleInputChange('yearOfPassing', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2025"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      value={editForm.branch || ''}
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Computer Science Engineering"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Interests Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editForm.interests : profile.interests).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Add interest..."
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addInterest(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Social Links Edit */}
            {isEditing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={editForm.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <input
                      type="url"
                      value={editForm.socialLinks.github}
                      onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={editForm.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={editForm.socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={editForm.socialLinks.facebook}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
