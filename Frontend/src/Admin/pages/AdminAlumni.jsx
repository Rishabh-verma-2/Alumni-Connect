import React, { useState, useEffect } from 'react';
import { Users, Calendar, Mail, GraduationCap, CheckCircle, XCircle, Search, Phone, MapPin, Briefcase, User, X, Plus, Trash2, BookOpen } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { alumniAPI, studentAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminAlumni = () => {
  const { token } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState('alumni');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({ enrollmentId: '', role: 'alumni' });
  const [addingEnrollment, setAddingEnrollment] = useState(false);
  const [deletingEnrollment, setDeletingEnrollment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null);

  useEffect(() => {
    fetchAlumni();
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const filtered = alumni.filter(alumnus => 
      alumnus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAlumni(filtered);
  }, [alumni, searchTerm]);

  useEffect(() => {
    const filtered = enrollments
      .filter(enrollment => enrollment.role === 'alumni')
      .filter(enrollment => 
        enrollment.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFilteredEnrollments(filtered);
  }, [enrollments, searchTerm]);

  const fetchAlumni = async () => {
    try {
      const response = await alumniAPI.getAllAlumni(token);
      setAlumni(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch alumni');
      console.error('Error fetching alumni:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllEnrollments(token);
      const enrollmentData = response.data.data || [];
      const alumniEnrollments = enrollmentData.filter(e => e.role === 'alumni');
      setEnrollments(alumniEnrollments);
    } catch (error) {
      toast.error('Failed to fetch enrollments');
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAlumniClick = (alumnus) => {
    setSelectedAlumni(alumnus);
    setShowProfileModal(true);
  };

  const handleProfileClose = () => {
    setShowProfileModal(false);
    setSelectedAlumni(null);
  };

  const handleAddEnrollment = async (e) => {
    e.preventDefault();
    if (!newEnrollment.enrollmentId.trim()) {
      toast.error('Enrollment ID is required');
      return;
    }
    
    try {
      setAddingEnrollment(true);
      await studentAPI.createEnrollment(newEnrollment, token);
      toast.success('Alumni enrollment added successfully!');
      setShowAddModal(false);
      setNewEnrollment({ enrollmentId: '', role: 'alumni' });
      fetchEnrollments();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add enrollment';
      toast.error(errorMessage);
    } finally {
      setAddingEnrollment(false);
    }
  };

  const handleDeleteClick = (enrollment) => {
    setEnrollmentToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!enrollmentToDelete) return;
    
    try {
      setDeletingEnrollment(enrollmentToDelete._id);
      await studentAPI.deleteEnrollment(enrollmentToDelete._id, token);
      toast.success('Enrollment deleted successfully!');
      fetchEnrollments();
      setShowDeleteModal(false);
      setEnrollmentToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete enrollment';
      toast.error(errorMessage);
    } finally {
      setDeletingEnrollment(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEnrollmentToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage alumni profiles and data</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600 dark:text-gray-400">Alumni: </span>
              <span className="font-bold text-green-600 dark:text-green-400">{alumni.length}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-md">
              <span className="text-sm text-gray-600 dark:text-gray-400">Enrollments: </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{enrollments.length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('alumni')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alumni'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Alumni ({alumni.length})
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrollments'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Alumni Enrollments ({enrollments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'alumni' ? 'Search alumni...' : 'Search enrollments...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {activeTab === 'alumni' ? (
                  <>
                    <GraduationCap className="text-green-500" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Alumni</h2>
                  </>
                ) : (
                  <>
                    <BookOpen className="text-blue-500" size={24} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Alumni Enrollments</h2>
                  </>
                )}
              </div>
              {activeTab === 'enrollments' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Enrollment</span>
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading {activeTab}...</p>
              </div>
            ) : activeTab === 'alumni' ? (
              filteredAlumni.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {searchTerm ? 'No alumni found matching your search.' : 'No alumni found.'}
                  </p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Alumni Info</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Enrollment ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Course & Year</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlumni.map((alumnus) => (
                      <tr key={alumnus._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              {alumnus.profile?.profilePicture ? (
                                <img 
                                  src={alumnus.profile.profilePicture} 
                                  alt={alumnus.name} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {alumnus.name ? alumnus.name.charAt(0).toUpperCase() : alumnus.username?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => handleAlumniClick(alumnus)}
                                className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors text-left"
                              >
                                {alumnus.name || alumnus.username || 'N/A'}
                              </button>
                              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                <Mail size={14} />
                                <span>{alumnus.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="text-green-500" size={16} />
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {alumnus.enrollmentId || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <div>{alumnus.profile?.course || 'N/A'}</div>
                            {alumnus.profile?.graduationYear && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">Graduated {alumnus.profile.graduationYear}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="text-blue-500" size={16} />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {alumnus.profile?.phone || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="text-purple-500" size={16} />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {alumnus.profile?.currentCompany || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {alumnus.isVerified ? (
                              <>
                                <CheckCircle className="text-green-500" size={16} />
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-red-500" size={16} />
                                <span className="text-red-600 dark:text-red-400 text-sm font-medium">Unverified</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(alumnus.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )
            ) : (
              filteredEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {searchTerm ? 'No enrollments found matching your search.' : 'No enrollments found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Enrollment ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Created Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Updated Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrollments.map((enrollment) => (
                        <tr key={enrollment._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="text-green-500" size={16} />
                              <span className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                                {enrollment.enrollmentId}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {enrollment.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="text-gray-400" size={16} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(enrollment.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="text-gray-400" size={16} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(enrollment.updatedAt)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleDeleteClick(enrollment)}
                              disabled={deletingEnrollment === enrollment._id}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={16} />
                              <span className="text-sm">
                                {deletingEnrollment === enrollment._id ? 'Deleting...' : 'Delete'}
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

        {/* Add Enrollment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Alumni Enrollment</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddEnrollment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enrollment ID
                  </label>
                  <input
                    type="text"
                    value={newEnrollment.enrollmentId}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, enrollmentId: e.target.value })}
                    placeholder="Enter enrollment ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={newEnrollment.role}
                    onChange={(e) => setNewEnrollment({ ...newEnrollment, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingEnrollment}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingEnrollment ? 'Adding...' : 'Add Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Enrollment</h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete enrollment <span className="font-mono font-semibold text-gray-900 dark:text-white">{enrollmentToDelete?.enrollmentId}</span>?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingEnrollment}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingEnrollment ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alumni Profile Modal */}
        {showProfileModal && selectedAlumni && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-600 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Alumni Profile</h3>
                  <button
                    onClick={handleProfileClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    {selectedAlumni.profile?.profilePicture ? (
                      <img 
                        src={selectedAlumni.profile.profilePicture} 
                        alt={selectedAlumni.name} 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {selectedAlumni.name ? selectedAlumni.name.charAt(0).toUpperCase() : selectedAlumni.username?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAlumni.name || selectedAlumni.username || 'N/A'}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedAlumni.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedAlumni.isVerified ? (
                        <>
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-green-600 dark:text-green-400 text-sm">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-500" size={16} />
                          <span className="text-red-600 dark:text-red-400 text-sm">Unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrollment ID</label>
                      <p className="font-mono text-gray-900 dark:text-white">{selectedAlumni.enrollmentId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Course</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.course || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Graduation Year</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.graduationYear || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Company</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.currentCompany || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.jobTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                      <p className="text-gray-900 dark:text-white">{selectedAlumni.profile?.experience || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</label>
                      <p className="text-gray-900 dark:text-white">{formatDate(selectedAlumni.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedAlumni.profile?.address && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-gray-900 dark:text-white">{selectedAlumni.profile.address}</p>
                  </div>
                )}

                {/* Bio */}
                {selectedAlumni.profile?.bio && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</label>
                    <p className="text-gray-900 dark:text-white">{selectedAlumni.profile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedAlumni.profile?.skills?.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAlumni.profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {selectedAlumni.profile?.achievements?.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Achievements</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAlumni.profile.achievements.map((achievement, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full">
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlumni;