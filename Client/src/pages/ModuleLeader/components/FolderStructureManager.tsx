import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface FolderStructure {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parent: string | null;
  children?: FolderStructure[];
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const FolderStructureManager: React.FC = () => {
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([
    {
      id: '1',
      name: 'Module Documents',
      type: 'folder',
      parent: null,
      permissions: { read: ['teachers', 'students'], write: ['module-leader'], admin: ['module-leader'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: '2',
          name: 'Assignments',
          type: 'folder',
          parent: '1',
          permissions: { read: ['teachers'], write: ['teachers'], admin: ['module-leader'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Question Papers',
          type: 'folder',
          parent: '1',
          permissions: { read: ['teachers'], write: ['teachers'], admin: ['module-leader'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Course Materials',
          type: 'folder',
          parent: '1',
          permissions: { read: ['teachers', 'students'], write: ['teachers'], admin: ['module-leader'] },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const newFolder: FolderStructure = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      parent: selectedParent,
      permissions: { read: ['teachers'], write: ['teachers'], admin: ['module-leader'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to folder structure (simplified for demo)
    setFolderStructure(prev => [...prev, newFolder]);
    setNewFolderName('');
    setSelectedParent(null);
    setShowCreateModal(false);
    toast.success('Folder created successfully');
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFolder = (folder: FolderStructure, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    
    return (
      <div key={folder.id} className="select-none">
        <div 
          className={`flex items-center py-2 px-3 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => folder.children && toggleFolder(folder.id)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {folder.children && (
              <span className="text-gray-400 text-xs">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span className="text-blue-500 text-lg">
              {folder.type === 'folder' ? '📁' : '📄'}
            </span>
            <span className="text-gray-900 font-medium">{folder.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {folder.permissions.read.join(', ')}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedParent(folder.id);
                setShowCreateModal(true);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add
            </button>
          </div>
        </div>
        {folder.children && isExpanded && (
          <div>
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Folder Structure Management</h2>
          <p className="text-gray-600 mt-1">Design and manage the organization of module documents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create Folder
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">12</div>
          <div className="text-blue-100">Total Folders</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">45</div>
          <div className="text-green-100">Documents</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">8</div>
          <div className="text-purple-100">Teachers Access</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">156</div>
          <div className="text-orange-100">Student Access</div>
        </div>
      </div>

      {/* Folder Tree */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Document Structure</h3>
          <p className="text-sm text-gray-600">Manage folders and permissions for document organization</p>
        </div>
        <div className="p-4">
          {folderStructure.map(folder => renderFolder(folder))}
        </div>
      </div>

      {/* Permission Management */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Read Access</h4>
            <p className="text-sm text-blue-700 mt-1">Who can view documents in folders</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Write Access</h4>
            <p className="text-sm text-green-700 mt-1">Who can upload/modify documents</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">Admin Access</h4>
            <p className="text-sm text-purple-700 mt-1">Who can manage folder structure</p>
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h3 className="text-lg font-semibold mb-4 text-black">Create New Folder</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter folder name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Folder
              </label>
              <select
                name='parentFolder'
                title='parentFolder'
                value={selectedParent || ''}
                onChange={(e) => setSelectedParent(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Root Level</option>
                {folderStructure.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderStructureManager;
