import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { useGetDashboardStatsQuery } from '../../redux/api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardStats from './components/DashboardStats';
import DepartmentManagement from './components/DepartmentManagement';
import CourseManagement from './components/CourseManagement';
import BatchManagement from './components/BatchManagement';
import SectionManagement from './components/SectionManagement';
import UserManagement from './components/UserManagement';

type TabType = 'dashboard' | 'departments' | 'courses' | 'batches' | 'sections' | 'users';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'batches', label: 'Batches', icon: '👥' },
    { id: 'sections', label: 'Sections', icon: '📝' },
    { id: 'users', label: 'Users', icon: '👤' },
  ] as const;

  const renderTabContent = () => {
    if (statsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={dashboardStats} />;
      case 'departments':
        return <DepartmentManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'sections':
        return <SectionManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <DashboardStats stats={dashboardStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage departments, courses, batches, and sections
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, <span className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
