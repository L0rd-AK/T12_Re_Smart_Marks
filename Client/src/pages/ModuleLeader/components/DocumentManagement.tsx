import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { GoogleDriveService } from '../../../services/googleDriveService';

interface Document {
  id: string;
  name: string;
  type: 'assignment' | 'lecture-notes' | 'syllabus' | 'reading-material' | 'other';
  description: string;
  fileUrl?: string;
  targetAudience: string[];
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  distributedTo: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  status: 'active' | 'inactive';
}

// Google Drive configuration
const PARENT_FOLDER_ID = '1D-y0Ck0_0ArHmxv4xPwWTIjrhVWT1INR';

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Course Syllabus - Computer Science',
      type: 'syllabus',
      description: 'Updated syllabus for the current semester',
      targetAudience: ['all-teachers'],
      priority: 'high',
      dueDate: '2025-08-01',
      status: 'published',
      createdAt: '2025-07-20',
      distributedTo: ['teacher1', 'teacher2', 'teacher3'],
    },
    {
      id: '2',
      name: 'Assignment Guidelines',
      type: 'assignment',
      description: 'Guidelines for creating and grading assignments',
      targetAudience: ['subject-teachers'],
      priority: 'medium',
      status: 'draft',
      createdAt: '2025-07-22',
      distributedTo: [],
    },
  ]);

  const [teachers] = useState<Teacher[]>([
    { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', subjects: ['Mathematics'], status: 'active' },
    { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', subjects: ['Physics'], status: 'active' },
    { id: 'teacher3', name: 'Dr. Williams', email: 'williams@university.edu', subjects: ['Chemistry'], status: 'active' },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'assignment' as Document['type'],
    description: '',
    targetAudience: [] as string[],
    priority: 'medium' as Document['priority'],
    dueDate: '',
    file: null as File | null,
  });

  // Google Drive upload state
  const [driveUpload, setDriveUpload] = useState({
    year: '',
    semester: '',
    batch: '',
    term: '',
    files: null as FileList | null,
    isUploading: false,
  });

  // Initialize Google Drive Service on component mount
  useEffect(() => {
    const initializeGoogleDrive = async () => {
      try {
        await GoogleDriveService.initialize();
        console.log('Google Drive Service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Google Drive Service:', error);
      }
    };

    initializeGoogleDrive();
  }, []);

  // Generate folder name from selections
  const generateFolderName = () => {
    if (!driveUpload.year || !driveUpload.semester || !driveUpload.batch || !driveUpload.term) {
      return '';
    }
    return `${driveUpload.year}_${driveUpload.semester}_${driveUpload.batch}-${driveUpload.term}`;
  };

  // Check if upload can be performed
  const canUpload = () => {
    return driveUpload.year && driveUpload.semester && driveUpload.batch && 
           driveUpload.term && driveUpload.files && driveUpload.files.length > 0 && 
           !driveUpload.isUploading && GoogleDriveService.isSignedIn();
  };

  // Check if Google Drive API is properly loaded and authenticated
  const isGoogleDriveReady = () => {
    return GoogleDriveService.isSignedIn();
  };

  // Check if Google API is loaded (not necessarily authenticated)
  const isGoogleAPILoaded = () => {
    // For the GoogleDriveService, we assume the API can be loaded
    // The service handles initialization internally
    return true;
  };

  // Handle Google Drive connection
  const handleConnectToDrive = async () => {
    try {
      await GoogleDriveService.signIn();
      toast.success('Successfully connected to Google Drive!');
    } catch (error: unknown) {
      console.error('Sign-in error:', error);
      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user') || error.message.includes('cancelled')) {
          toast.error('Sign-in cancelled by user.');
        } else {
          toast.error(`Failed to connect: ${error.message}`);
        }
      } else {
        toast.error('Failed to connect to Google Drive. Please try again.');
      }
    }
  };

  // Google Drive folder creation function
  const createFolderInDrive = async (folderName: string, parentId: string) => {
    try {
      const folder = await GoogleDriveService.createFolder(folderName, parentId);
      return folder.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  // Check if folder exists
  const findFolderByName = async (folderName: string, parentId: string) => {
    try {
      const folder = await GoogleDriveService.findFolderByName(folderName, parentId);
      return folder ? folder.id : null;
    } catch (error) {
      console.error('Error searching for folder:', error);
      throw error;
    }
  };

  // Upload file to Google Drive
  const uploadFileToDrive = async (file: File, folderId: string) => {
    try {
      const result = await GoogleDriveService.uploadFileToFolder(file, folderId, file.name);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Handle Google Drive upload
  const handleDriveUpload = async () => {
    if (!canUpload()) {
      toast.error('Please fill all fields and select files');
      return;
    }

    setDriveUpload(prev => ({ ...prev, isUploading: true }));

    try {
      const folderName = generateFolderName();
      
      // Check if folder exists, create if not
      let folderId = await findFolderByName(folderName, PARENT_FOLDER_ID);
      if (!folderId) {
        folderId = await createFolderInDrive(folderName, PARENT_FOLDER_ID);
        toast.success(`Created folder: ${folderName}`);
      }

      // Upload all selected files
      const files = Array.from(driveUpload.files!);
      const uploadPromises = files.map(file => uploadFileToDrive(file, folderId!));
      
      await Promise.all(uploadPromises);
      
      toast.success(`Successfully uploaded ${files.length} file(s) to ${folderName}`);
      
      // Reset form
      setDriveUpload({
        year: '',
        semester: '',
        batch: '',
        term: '',
        files: null,
        isUploading: false,
      });
      
      // Reset file input
      const fileInput = document.getElementById('drive-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error: unknown) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload files. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('signed in')) {
          errorMessage = 'Please sign in to Google Drive first.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Google Drive quota exceeded. Please try again later.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      setDriveUpload(prev => ({ ...prev, isUploading: false }));
    }
  };

  const handleCreateDocument = () => {
    if (!newDocument.name.trim() || !newDocument.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate file upload URL (in real app, upload to server first)
    const fileUrl = newDocument.file ? `uploads/${newDocument.file.name}` : undefined;

    const document: Document = {
      id: Date.now().toString(),
      ...newDocument,
      fileUrl,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      distributedTo: [],
    };

    setDocuments(prev => [...prev, document]);
    setNewDocument({
      name: '',
      type: 'assignment',
      description: '',
      targetAudience: [],
      priority: 'medium',
      dueDate: '',
      file: null,
    });
    setShowCreateModal(false);
    
    if (newDocument.file) {
      toast.success(`Document created successfully with file: ${newDocument.file.name}`);
    } else {
      toast.success('Document created successfully');
    }
  };

  const handleDistribute = () => {
    if (!selectedDocument || selectedTeachers.length === 0) {
      toast.error('Please select teachers to distribute to');
      return;
    }

    setDocuments(prev => prev.map(doc => 
      doc.id === selectedDocument.id 
        ? { ...doc, distributedTo: [...new Set([...doc.distributedTo, ...selectedTeachers])], status: 'published' as const }
        : doc
    ));

    setShowDistributeModal(false);
    setSelectedDocument(null);
    setSelectedTeachers([]);
    toast.success('Document distributed successfully');
  };

  const filteredDocuments = documents.filter(doc => {
    const statusMatch = filterStatus === 'all' || doc.status === filterStatus;
    const typeMatch = filterType === 'all' || doc.type === filterType;
    return statusMatch && typeMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Distribution</h2>
          <p className="text-gray-600 mt-1">Distribute academic materials and documents to teachers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create Document
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{documents.length}</div>
          <div className="text-blue-100">Total Documents</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{documents.filter(d => d.status === 'published').length}</div>
          <div className="text-green-100">Published</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{documents.filter(d => d.status === 'draft').length}</div>
          <div className="text-yellow-100">Drafts</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{teachers.filter(t => t.status === 'active').length}</div>
          <div className="text-purple-100">Active Teachers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by type"
        >
          <option value="all">All Types</option>
          <option value="assignment">Assignment</option>
          <option value="lecture-notes">Lecture Notes</option>
          <option value="syllabus">Syllabus</option>
          <option value="reading-material">Reading Material</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Google Drive Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload to Google Drive</h3>
            <p className="text-gray-600 text-sm mt-1">Upload documents directly to organized folders</p>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>📁 Target: Smart Marks System</span>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
              isGoogleDriveReady() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                isGoogleDriveReady() ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isGoogleDriveReady() ? 'Connected' : 'Not Connected'}
            </div>
          </div>
        </div>

        {!isGoogleDriveReady() && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-amber-800">
                  <span className="font-medium">⚠️ Google Drive Not Connected:</span>
                  <span className="ml-1">
                    {!isGoogleAPILoaded() 
                      ? 'Google API is not loaded. Please refresh the page and ensure you have an internet connection.' 
                      : 'Please connect to Google Drive to enable file uploads.'
                    }
                  </span>
                </div>
              </div>
              <button
                onClick={handleConnectToDrive}
                disabled={!isGoogleAPILoaded()}
                className={`ml-4 px-4 py-2 text-sm rounded-lg transition-colors duration-200 flex items-center ${
                  isGoogleAPILoaded()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isGoogleAPILoaded() 
                    ? 'Google API not loaded - please refresh the page'
                    : 'Click to connect to Google Drive'
                }
              >
                <span className="mr-2">{isGoogleAPILoaded() ? '🔗' : '⚠️'}</span>
                {isGoogleAPILoaded() ? 'Connect to Drive' : 'API Not Loaded'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={driveUpload.year}
              onChange={(e) => setDriveUpload(prev => ({ ...prev, year: e.target.value }))}
              className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select year"
            >
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Semester Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              value={driveUpload.semester}
              onChange={(e) => setDriveUpload(prev => ({ ...prev, semester: e.target.value }))}
              className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select semester"
            >
              <option value="">Select Semester</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </select>
          </div>

          {/* Batch Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select
              value={driveUpload.batch}
              onChange={(e) => setDriveUpload(prev => ({ ...prev, batch: e.target.value }))}
              className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select batch"
            >
              <option value="">Select Batch</option>
              <option value="60">60</option>
              <option value="61">61</option>
              <option value="62">62</option>
              <option value="63">63</option>
              <option value="64">64</option>
              <option value="65">65</option>
            </select>
          </div>

          {/* Term Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select
              value={driveUpload.term}
              onChange={(e) => setDriveUpload(prev => ({ ...prev, term: e.target.value }))}
              className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select term"
            >
              <option value="">Select Term</option>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
            </select>
          </div>
        </div>

        {/* Folder Name Preview */}
        {generateFolderName() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">📂 Folder will be created/used: </span>
              <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                {generateFolderName()}
              </span>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files to Upload
            </label>
            <input
              id="drive-file-input"
              type="file"
              multiple
              title="Select files to upload to Google Drive"
              placeholder="Choose files..."
              onChange={(e) => setDriveUpload(prev => ({ ...prev, files: e.target.files }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
            />
            <div className="mt-1 text-xs text-gray-500">
              Supported formats: PDF, Word, Text, PowerPoint, Excel, ZIP, RAR
            </div>
          </div>

          {/* Selected Files Preview */}
          {driveUpload.files && driveUpload.files.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({driveUpload.files.length}):
              </div>
              <div className="space-y-1">
                {Array.from(driveUpload.files).map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📎</span>
                    <span className="flex-1">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end space-x-3">
            {!isGoogleDriveReady() && (
              <button
                onClick={handleConnectToDrive}
                disabled={!isGoogleAPILoaded()}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                  isGoogleAPILoaded()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !isGoogleAPILoaded() 
                    ? 'Google API not loaded - please refresh the page'
                    : 'Click to connect to Google Drive'
                }
              >
                <span className="mr-2">{isGoogleAPILoaded() ? '🔗' : '⚠️'}</span>
                {isGoogleAPILoaded() ? 'Connect to Drive' : 'API Not Loaded'}
              </button>
            )}
            <button
              onClick={handleDriveUpload}
              disabled={!canUpload()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                canUpload()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={
                !isGoogleDriveReady() 
                  ? 'Google Drive not connected - please connect to Google Drive first' 
                  : !driveUpload.year || !driveUpload.semester || !driveUpload.batch || !driveUpload.term
                  ? 'Please select all dropdown fields'
                  : !driveUpload.files || driveUpload.files.length === 0
                  ? 'Please select files to upload'
                  : 'Ready to upload'
              }
            >
              {driveUpload.isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : !isGoogleDriveReady() ? (
                '⚠️ Drive Not Connected'
              ) : (
                '🚀 Upload to Drive'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distributed To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {document.name}
                        {document.fileUrl && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            📎 File
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{document.description}</div>
                      {document.fileUrl && (
                        <div className="text-xs text-blue-600 mt-1">
                          Attached: {document.fileUrl.split('/').pop()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {document.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(document.priority)}`}>
                      {document.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.distributedTo.length} teachers
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowDistributeModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Distribute
                    </button>
                    {document.fileUrl && (
                      <button 
                        onClick={() => {
                          // In a real app, this would download/open the file
                          const fileName = document.fileUrl?.split('/').pop() || 'file';
                          toast.success(`Opening file: ${fileName}`);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View File
                      </button>
                    )}
                    <button className="text-green-600 hover:text-green-900">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4 text-black">Create New Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as Document['type'] }))}
                  className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Document type"
                >
                  <option value="assignment">Assignment</option>
                  <option value="lecture-notes">Lecture Notes</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="reading-material">Reading Material</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newDocument.priority}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, priority: e.target.value as Document['priority'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  title="Document priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  placeholder='Select due date'
                  type="date"
                  value={newDocument.dueDate}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <input
                  type="file"
                  title="Select file to upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewDocument(prev => ({ ...prev, file }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                />
                {newDocument.file && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected file: <span className="font-medium text-blue-600">{newDocument.file.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewDocument(prev => ({ ...prev, file: null }))}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, Word, Text, PowerPoint, Excel
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distribute Modal */}
      {showDistributeModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4 text-black">
              Distribute Document: {selectedDocument.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Teachers
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {teachers.map(teacher => (
                  <label key={teacher.id} className="flex items-center text-black">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeachers(prev => [...prev, teacher.id]);
                        } else {
                          setSelectedTeachers(prev => prev.filter(id => id !== teacher.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-black">
                      {teacher.name} - {teacher.subjects.join(', ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDistributeModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDistribute}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Distribute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
