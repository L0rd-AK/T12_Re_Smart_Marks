import React, { useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '../../redux/api/authApi';
import type { User } from '../../redux/api/authApi';
import { updateUser } from '../../redux/features/authSlice';
import { useAppDispatch } from '../../redux/hooks';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
  employeeId?: string;
  designation?: string;
  emailId?: string;
  mobileNumber?: string;
  roomNumber?: string;
  initial?: string;
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || currentUser?.firstName || '',
    lastName: user?.lastName || currentUser?.lastName || '',
    email: user?.email || currentUser?.email || '',
    name: user?.name || currentUser?.name || 'Mehedi Hasan',
    employeeId: user?.employeeId || currentUser?.employeeId || '342353',
    designation: user?.designation || currentUser?.designation || 'Lecturer',
    emailId: user?.emailId || currentUser?.emailId || 'mehedi15-4680@diu.edu.bd',
    mobileNumber: user?.mobileNumber || currentUser?.mobileNumber || '+8801767705251',
    roomNumber: user?.roomNumber || currentUser?.roomNumber || '810',
    initial: user?.initial || currentUser?.initial || 'ADS',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Update form data when user data changes
  React.useEffect(() => {
    if (user || currentUser) {
      const userData = user || currentUser;
      setFormData({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        name: userData?.name || 'Mehedi Hasan',
        employeeId: userData?.employeeId || '342353',
        designation: userData?.designation || 'Lecturer',
        emailId: userData?.emailId || 'mehedi15-4680@diu.edu.bd',
        mobileNumber: userData?.mobileNumber || '+8801767705251',
        roomNumber: userData?.roomNumber || '810',
        initial: userData?.initial || 'ADS',
      });
    }
  }, [user, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.name,
        employeeId: formData.employeeId,
        designation: formData.designation,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        roomNumber: formData.roomNumber,
        initial: formData.initial,
      };

      if (avatarFile && avatarPreview) {
        // In a real app, you'd upload the file to a server
        // For now, we'll just simulate the update
        updateData.avatar = avatarPreview;
      }

      await updateProfile(updateData).unwrap();
      
      // Update local state
      dispatch(updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: formData.name,
        employeeId: formData.employeeId,
        designation: formData.designation,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        roomNumber: formData.roomNumber,
        initial: formData.initial,
        ...(avatarPreview && { avatar: avatarPreview })
      }));

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset form data to current user data
    const userData = user || currentUser;
    setFormData({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      name: userData?.name || 'Mehedi Hasan',
      employeeId: userData?.employeeId || '342353',
      designation: userData?.designation || 'Lecturer',
      emailId: userData?.emailId || 'mehedi15-4680@diu.edu.bd',
      mobileNumber: userData?.mobileNumber || '+8801767705251',
      roomNumber: userData?.roomNumber || '',
      initial: userData?.initial || '',
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const userData = user || currentUser;
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">User not found</h2>
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                {/* Avatar Section */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {avatarPreview || userData.avatar ? (
                      <img
                        src={avatarPreview || userData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {getInitials(userData.firstName, userData.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors" title="Change profile picture">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        aria-label="Upload profile picture"
                      />
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>

                {/* User Info */}
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-600 mb-4">{userData.email}</p>
                
                {/* Role Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  {userData.role === 'admin' ? 'Administrator' : 'User'}
                </div>

                {/* Email Verification Status */}
                {!userData.isEmailVerified && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Email Not Verified
                  </div>
                )}

                {/* Account Info */}
                <div className="text-left space-y-3 text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Member since:</span>
                    <span className="font-bold text-gray-900">{formatDate(userData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Last updated:</span>
                    <span className="font-bold text-gray-900">{formatDate(userData.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Name:</span>
                    <span className="font-bold text-gray-900">{userData.name || 'Mehedi Hasan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Employee ID:</span>
                    <span className="font-bold text-gray-900">{userData.employeeId || '342353'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Designation:</span>
                    <span className="font-bold text-gray-900">{userData.designation || 'Lecturer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Email ID:</span>
                    <span className="font-bold text-gray-900">{userData.emailId || 'mehedi15-4680@diu.edu.bd'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Mobile Number:</span>
                    <span className="font-bold text-gray-900">{userData.mobileNumber || '+8801767705251'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Room Number:</span>
                    <span className="font-bold text-gray-900">{userData.roomNumber || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        isEditing 
                          ? 'border-gray-300 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        isEditing 
                          ? 'border-gray-300 bg-white text-gray-900' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Name with Initial */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Initial
                  </label>
                  <input
                    type="text"
                    id="initial"
                    name="initial"
                    value={formData.initial}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Designation */}
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Email ID */}
                <div>
                  <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="emailId"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    required
                  />
                </div>


                {/* Room Number */}
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isEditing 
                        ? 'border-gray-300 bg-white text-gray-900' 
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>

                {/* Avatar Upload */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                                         <div className="flex items-center space-x-4">
                       <input
                         type="file"
                         accept="image/*"
                         onChange={handleAvatarChange}
                         className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                         aria-label="Upload profile picture"
                         title="Select a profile picture"
                       />
                     </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a new profile picture (JPG, PNG, GIF up to 5MB)
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Account Security Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-500">Last changed: Never</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
