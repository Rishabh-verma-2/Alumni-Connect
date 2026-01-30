import React from 'react';
import { Save, X, UserCheck } from 'lucide-react';

const AlumniProfileForm = ({ 
  profile, 
  isEditing, 
  handleInputChange, 
  isEditingUsername, 
  newUsername, 
  setNewUsername, 
  handleUsernameEdit, 
  handleUsernameSave, 
  handleUsernameCancel, 
  usernameLoading 
}) => {
  return (
    <div className="xl:col-span-2 space-y-4 sm:space-y-6 order-2 xl:order-2 w-full max-w-full overflow-hidden">
      {/* Username Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <UserCheck className="mr-2" size={18} />
            Name
          </h3>
          {!isEditingUsername && (
            <button
              onClick={handleUsernameEdit}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium self-start sm:self-auto"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingUsername ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              placeholder="Enter new name"
              minLength={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUsernameSave}
                disabled={usernameLoading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-1 text-sm sm:text-base"
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                <span>{usernameLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleUsernameCancel}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-1 text-sm sm:text-base"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg break-words">{profile.user.name}</p>
            <span className="text-xs sm:text-sm text-gray-500">This is how others will see you</span>
          </div>
        )}
      </div>

      {/* Academic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year of Passing</label>
            {isEditing ? (
              <input
                type="number"
                name="yearOfPassing"
                value={profile.yearOfPassing}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{profile.yearOfPassing || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
            {isEditing ? (
              <input
                type="text"
                name="branch"
                value={profile.branch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{profile.branch || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Company</label>
            {isEditing ? (
              <input
                type="text"
                name="currentCompany"
                value={profile.currentCompany}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{profile.currentCompany || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Designation</label>
            {isEditing ? (
              <input
                type="text"
                name="currentDesignation"
                value={profile.currentDesignation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{profile.currentDesignation || 'Not set'}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Location</label>
            {isEditing ? (
              <input
                type="text"
                name="currentLocation"
                value={profile.currentLocation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
              />
            ) : (
              <p className="text-gray-900 dark:text-white text-sm sm:text-base break-words">{profile.currentLocation || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Links */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Social Links</h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
              <input
                type="url"
                name="social.linkedin"
                value={profile.socialLinks?.linkedin || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub</label>
              <input
                type="url"
                name="social.github"
                value={profile.socialLinks?.github || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter</label>
              <input
                type="url"
                name="social.twitter"
                value={profile.socialLinks?.twitter || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
              <input
                type="url"
                name="social.instagram"
                value={profile.socialLinks?.instagram || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
              <input
                type="url"
                name="social.facebook"
                value={profile.socialLinks?.facebook || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                placeholder="https://facebook.com/username"
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Achievements & Bio</h3>
        {isEditing ? (
          <textarea
            name="achievements"
            value={profile.achievements}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base resize-y"
            placeholder="Share your achievements, career highlights, and professional journey..."
          />
        ) : (
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm sm:text-base break-words">
            {profile.achievements || 'No achievements added yet.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AlumniProfileForm;