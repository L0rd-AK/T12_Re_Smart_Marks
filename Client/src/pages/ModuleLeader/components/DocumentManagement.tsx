import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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
  });

  const handleCreateDocument = () => {
    if (!newDocument.name.trim() || !newDocument.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const document: Document = {
      id: Date.now().toString(),
      ...newDocument,
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
    });
    setShowCreateModal(false);
    toast.success('Document created successfully');
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
                      <div className="text-sm font-medium text-gray-900">{document.name}</div>
                      <div className="text-sm text-gray-500">{document.description}</div>
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
