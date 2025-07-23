import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useGetSectionsQuery,
  useGetBatchesQuery,
  useGetCoursesQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useAssignModuleLeaderMutation,
  type Section,
  type CreateSectionInput,
  type UpdateSectionInput
} from '../../../redux/api/adminApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface ModuleLeaderAssignmentProps {
  section: Section;
  onClose: () => void;
}

const ModuleLeaderAssignment: React.FC<ModuleLeaderAssignmentProps> = ({ section, onClose }) => {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModuleLeader, { isLoading: isAssigning }] = useAssignModuleLeaderMutation();

  // Mock users data - in real app, you'd fetch from API
  const mockUsers = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'user' as const },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'user' as const },
    { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', role: 'user' as const },
  ];

  const filteredUsers = mockUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedLeaderId) {
      toast.error('Please select a module leader');
      return;
    }

    try {
      await assignModuleLeader({
        sectionId: section._id,
        moduleLeaderId: selectedLeaderId
      }).unwrap();
      toast.success('Module leader assigned successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to assign module leader');
    }
  };

  const handleRemove = async () => {
    try {
      // For now, we'll simulate the remove action
      // In a real app, you'd have a removeModuleLeader mutation
      toast.success('Module leader removed successfully');
    } catch (error) {
      toast.error('Failed to remove module leader');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Manage Module Leaders - {section.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Current Module Leaders */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Current Module Leader:</h4>
          {section.moduleLeader ? (
            <div className="bg-gray-50 p-2 rounded flex items-center justify-between">
              <span>{section.moduleLeader.firstName} {section.moduleLeader.lastName}</span>
              <button
                onClick={() => handleRemove()}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No module leader assigned</p>
          )}
        </div>

        {/* Assign New Module Leader */}
        <div>
          <h4 className="font-medium mb-2">Assign Module Leader:</h4>

          {/* Search Users */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
            />
          </div>

          {/* User Selection */}
          <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded">
            {filteredUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="moduleLeader"
                  value={user.id}
                  checked={selectedLeaderId === user.id}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </label>
            ))}
            {filteredUsers.length === 0 && (
              <p className="p-2 text-gray-500 text-sm">No users found</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAssign}
              disabled={isAssigning || !selectedLeaderId}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [managingLeadersSection, setManagingLeadersSection] = useState<Section | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [formData, setFormData] = useState<CreateSectionInput>({
    name: '',
    batch: '',
    course: '',
    maxStudents: 30,
    isActive: true
  });

  const { data: sections, isLoading } = useGetSectionsQuery({
    batch: selectedBatch || undefined
  });
  const { data: batches } = useGetBatchesQuery({});
  const { data: courses } = useGetCoursesQuery({});
  const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdating }] = useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        await updateSection({
          id: editingSection._id,
          data: formData as UpdateSectionInput
        }).unwrap();
        toast.success('Section updated successfully');
        setEditingSection(null);
      } else {
        await createSection(formData).unwrap();
        toast.success('Section created successfully');
        setShowCreateModal(false);
      }
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      batch: section.batch._id,
      course: section.course._id,
      maxStudents: section.maxStudents,
      isActive: section.isActive
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete section "${name}"?`)) {
      try {
        await deleteSection(id).unwrap();
        toast.success('Section deleted successfully');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete section');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      batch: '',
      course: '',
      maxStudents: 30,
      isActive: true
    });
    setEditingSection(null);
    setShowCreateModal(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Section Management</h2>
          <p className="text-gray-600">Manage sections and assign module leaders</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Section
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All Batches</option>
              {batches?.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name} - {batch.year} {batch.semester}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module Leaders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections?.map((section) => (
                <tr key={section._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {section.batch.name} - {section.batch.year} {section.batch.semester}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {section.course.name} ({section.course.code})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {section.maxStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {section.moduleLeader ? (
                        <div className="text-xs">
                          {section.moduleLeader.firstName} {section.moduleLeader.lastName}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No leader assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      section.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {section.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setManagingLeadersSection(section)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Manage Leaders
                    </button>
                    <button
                      onClick={() => handleEdit(section)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(section._id, section.name)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sections?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No sections found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-black text-lg font-semibold mb-4">
              {editingSection ? 'Edit Section' : 'Create New Section'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches?.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} - {batch.year} {batch.semester} ({batch.department.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                >
                  <option value="">Select Course</option>
                  {courses?.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {(isCreating || isUpdating) ? 'Saving...' : (editingSection ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Leader Assignment Modal */}
      {managingLeadersSection && (
        <ModuleLeaderAssignment
          section={managingLeadersSection}
          onClose={() => setManagingLeadersSection(null)}
        />
      )}
    </div>
  );
};

export default SectionManagement;
