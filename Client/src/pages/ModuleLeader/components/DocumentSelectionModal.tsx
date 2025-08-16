import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Eye, Clock, Users } from 'lucide-react';
import { useGetDocumentDistributionsQuery, type DocumentDistribution } from '../../../redux/api/documentDistributionApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface DocumentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDocuments: DocumentDistribution[]) => void;
  teacherName: string;
  courseCode: string;
  loading?: boolean;
}

const DocumentSelectionModal: React.FC<DocumentSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  teacherName,
  courseCode,
  loading = false
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  // API call to get document distributions
  const { 
    data: distributionsData, 
    isLoading: distributionsLoading, 
    error: distributionsError 
  } = useGetDocumentDistributionsQuery({
    courseCode: courseCode,
    status: 'distributed',
    page: 1,
    limit: 100,
    search: searchTerm
  });

  const documents = distributionsData?.data || [];

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    const matchesPriority = !filterPriority || doc.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDocuments(new Set());
      setSearchTerm('');
      setFilterCategory('');
      setFilterPriority('');
    }
  }, [isOpen]);

  const handleDocumentToggle = (distributionId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(distributionId)) {
      newSelected.delete(distributionId);
    } else {
      newSelected.add(distributionId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.distributionId)));
    }
  };

  const handleConfirm = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.distributionId));
    onConfirm(selectedDocs);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'lecture-notes': <FileText className="w-4 h-4" />,
      'assignments': <FileText className="w-4 h-4" />,
      'syllabus': <FileText className="w-4 h-4" />,
      'reading-material': <FileText className="w-4 h-4" />,
      'exams': <FileText className="w-4 h-4" />,
      'templates': <FileText className="w-4 h-4" />,
      'other': <FileText className="w-4 h-4" />
    };
    return icons[category] || <FileText className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'urgent': 'text-red-600 bg-red-100',
      'high': 'text-orange-600 bg-orange-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-green-600 bg-green-100'
    };
    return colors[priority] || colors['medium'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Share Documents with {teacherName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select documents from {courseCode} to share with the requesting teacher
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
            title="Close modal"
            aria-label="Close document selection modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter by category"
                aria-label="Filter documents by category"
              >
                <option value="">All Categories</option>
                <option value="lecture-notes">Lecture Notes</option>
                <option value="assignments">Assignments</option>
                <option value="syllabus">Syllabus</option>
                <option value="reading-material">Reading Material</option>
                <option value="exams">Exams</option>
                <option value="templates">Templates</option>
                <option value="other">Other</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter by priority"
                aria-label="Filter documents by priority"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={filteredDocuments.length === 0}
              >
                {selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0
                  ? 'Deselect All'
                  : 'Select All'
                }
              </button>
              <span className="text-sm text-gray-600">
                {selectedDocuments.size} of {filteredDocuments.length} documents selected
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredDocuments.length} documents available
            </span>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {distributionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : distributionsError ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-600">Error loading documents. Please try again.</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No documents found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.distributionId}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDocuments.has(document.distributionId)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleDocumentToggle(document.distributionId)}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.distributionId)}
                        onChange={() => handleDocumentToggle(document.distributionId)}
                        className="mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        title={`Select ${document.title}`}
                        aria-label={`Select document: ${document.title}`}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getCategoryIcon(document.category)}
                              <h3 className="font-medium text-gray-900 truncate">
                                {document.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(document.priority)}`}>
                                {document.priority}
                              </span>
                            </div>
                            
                            {document.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {document.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{document.fileCount} files</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                <span>{formatFileSize(document.totalFileSize)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{document.accessTracking.totalViews} views</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {document.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {document.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedDocuments.size > 0 && (
              <span>
                Selected documents will be shared with {teacherName} via live view links
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedDocuments.size === 0 || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Share {selectedDocuments.size} Document{selectedDocuments.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelectionModal;
