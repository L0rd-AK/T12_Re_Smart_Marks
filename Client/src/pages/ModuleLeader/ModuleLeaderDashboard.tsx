import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentManagement from './components/DocumentManagement';
import FolderStructureManager from './components/FolderStructureManager';
import QuestionPaperTemplates from './components/QuestionPaperTemplates';
import SubmissionTracker from './components/SubmissionTracker';
import MeetingScheduler from './components/MeetingScheduler';
import TeacherCommunication from './components/TeacherCommunication';
import ModuleOverview from './components/ModuleOverview';
import TeacherRequests from './components/TeacherRequests';

type TabType = 'overview' | 'folders' | 'documents' | 'templates' | 'submissions' | 'meetings' | 'communication' | 'requests';

const ModuleLeaderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user)

  // Check if user has module leader permissions
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Module statistics and summary' },
    { id: 'folders', label: 'Folder Structure', icon: '📁', description: 'Manage document organization' },
    { id: 'documents', label: 'Document Distribution', icon: '📄', description: 'Distribute materials to teachers' },
    { id: 'templates', label: 'Question Templates', icon: '📝', description: 'Standardize question formats' },
    { id: 'submissions', label: 'Submission Tracker', icon: '📋', description: 'Track teacher submissions' },
    { id: 'meetings', label: 'Meetings', icon: '🗓️', description: 'Schedule and coordinate meetings' },
    { id: 'communication', label: 'Communication', icon: '💬', description: 'Message teachers and updates' },
    { id: 'requests', label: 'Teacher Requests', icon: '📝', description: 'Manage course requests and document submissions' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ModuleOverview />;
      case 'folders':
        return <FolderStructureManager />;
      case 'documents':
        return <DocumentManagement />;
      case 'templates':
        return <QuestionPaperTemplates />;
      case 'submissions':
        return <SubmissionTracker />;
      case 'meetings':
        return <MeetingScheduler />;
      case 'communication':
        return <TeacherCommunication />;
      case 'requests':
        return <TeacherRequests />;
      default:
        return <ModuleOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" ">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Module Leader Dashboard</h1>
              </div>
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.name}
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name}
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-0 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ModuleLeaderDashboard;
