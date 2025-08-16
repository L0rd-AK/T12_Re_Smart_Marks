import React, { useState } from 'react';
import { useGetSharedDocumentsQuery, type DocumentDistribution, type FileMetadata } from '../../redux/api/documentDistributionApi';
import { FileText, Download, Eye, Calendar, Tag, User, Book } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const TeacherSharedDocuments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // API call to get shared documents
  const { 
    data: documentsData, 
    isLoading, 
    error,
    refetch 
  } = useGetSharedDocumentsQuery();

  const documents = documentsData?.data || [];

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter((doc: DocumentDistribution) => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    const matchesPriority = !filterPriority || doc.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'lecture-notes': <FileText className="w-5 h-5" />,
      'assignments': <FileText className="w-5 h-5" />,
      'syllabus': <Book className="w-5 h-5" />,
      'reading-material': <FileText className="w-5 h-5" />,
      'exams': <FileText className="w-5 h-5" />,
      'templates': <FileText className="w-5 h-5" />,
      'other': <FileText className="w-5 h-5" />
    };
    return icons[category] || <FileText className="w-5 h-5" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'urgent': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors['medium'];
  };

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Error loading shared documents</p>
          <p className="text-sm mt-2">Please try again later</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared Documents</h1>
        <p className="text-gray-600">
          Documents shared with you by module leaders ({documents.length} total)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, description, course code, or tags..."
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

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDocuments.length} of {documents.length} documents
          {(searchTerm || filterCategory || filterPriority) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterPriority('');
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {documents.length === 0 ? 'No shared documents' : 'No documents match your search'}
          </h3>
          <p className="text-gray-600">
            {documents.length === 0 
              ? 'You haven\'t been shared any documents yet.'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document: DocumentDistribution) => (
            <div
              key={document.distributionId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(document.category)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(document.priority)}`}>
                      {document.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedCard(
                      expandedCard === document.distributionId ? null : document.distributionId
                    )}
                    className="text-gray-400 hover:text-gray-600"
                    title={expandedCard === document.distributionId ? "Collapse" : "Expand"}
                    aria-label={expandedCard === document.distributionId ? "Collapse document details" : "Expand document details"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                  {document.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {document.course.courseCode} - {document.course.courseName}
                </p>
                {document.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{document.fileCount} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{formatFileSize(document.totalFileSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{document.moduleLeader.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {document.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{document.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatCategoryName(document.category)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {document.accessTracking.totalViews} views
                  </span>
                </div>
              </div>

              {/* Expanded Content - Files */}
              {expandedCard === document.distributionId && document.files.length > 0 && (
                <div className="border-t border-gray-100 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Files</h4>
                  <div className="space-y-2">
                    {document.files.map((file: FileMetadata, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)} • {file.fileType}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <a
                            href={file.liveViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="View document"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={file.downloadLink}
                            download
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSharedDocuments;
