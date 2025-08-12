import { Request, Response } from 'express';
import { Course, ICourse } from '../models/Course';
import { Department } from '../models/Department';
import User from '../models/User';
import mongoose from 'mongoose';

// Get all courses with filters
export const getCourses = async (req: Request, res: Response) => {
  try {
    const {
      department,
      year,
      semester,
      isActive,
      moduleLeader,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter: any = {};

    if (department) filter.department = department;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (moduleLeader) filter.moduleLeader = moduleLeader;

    let query = Course.find(filter)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    // Handle search
    if (search) {
      query = Course.find({
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { code: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      })
        .populate('department', 'name code')
        .populate('moduleLeader', 'name email')
        .populate('prerequisites', 'name code')
        .populate('createdBy', 'name email');
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const courses = await query.skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get single course by ID
export const getCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(id)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get courses by department
export const getCoursesByDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID',
      });
    }

    const courses = await Course.findByDepartment(departmentId);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses by department:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses by department',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get courses by module leader
export const getCoursesByModuleLeader = async (req: Request, res: Response) => {
  try {
    const { moduleLeaderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleLeaderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module leader ID',
      });
    }

    const courses = await Course.findByModuleLeader(moduleLeaderId);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses by module leader:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses by module leader',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get courses by year and semester
export const getCoursesByYearSemester = async (req: Request, res: Response) => {
  try {
    const { year, semester } = req.params;

    const courses = await Course.findByYearSemester(year, semester);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses by year and semester:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses by year and semester',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      description,
      creditHours,
      department,
      prerequisites,
      moduleLeader,
      year,
      semester,
    } = req.body;

    // Validate required fields
    if (!name || !code || !description || !creditHours || !department || !moduleLeader) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists',
      });
    }

    // Validate department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Validate module leader exists
    const moduleLeaderExists = await User.findById(moduleLeader);
    if (!moduleLeaderExists) {
      return res.status(400).json({
        success: false,
        message: 'Module leader not found',
      });
    }

    // Validate prerequisites if provided
    if (prerequisites && prerequisites.length > 0) {
      const validPrerequisites = await Course.find({
        _id: { $in: prerequisites },
      });
      if (validPrerequisites.length !== prerequisites.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more prerequisites not found',
        });
      }
    }

    const courseData = {
      name,
      code: code.toUpperCase(),
      description,
      creditHours: Number(creditHours),
      department,
      prerequisites: prerequisites || [],
      moduleLeader,
      year,
      semester,
      createdBy: req.user?.id,
    };

    const course = new Course(courseData);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if course code is being updated and if it already exists
    if (updateData.code && updateData.code !== course.code) {
      const existingCourse = await Course.findOne({ code: updateData.code.toUpperCase() });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course code already exists',
        });
      }
    }

    // Validate department if being updated
    if (updateData.department) {
      const departmentExists = await Department.findById(updateData.department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Department not found',
        });
      }
    }

    // Validate module leader if being updated
    if (updateData.moduleLeader) {
      const moduleLeaderExists = await User.findById(updateData.moduleLeader);
      if (!moduleLeaderExists) {
        return res.status(400).json({
          success: false,
          message: 'Module leader not found',
        });
      }
    }

    // Validate prerequisites if being updated
    if (updateData.prerequisites) {
      const validPrerequisites = await Course.find({
        _id: { $in: updateData.prerequisites },
      });
      if (validPrerequisites.length !== updateData.prerequisites.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more prerequisites not found',
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Toggle course status
export const toggleCourseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await course.toggleStatus();

    const updatedCourse = await Course.findById(id)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Course status toggled successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error toggling course status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle course status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Assign module leader
export const assignModuleLeader = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { moduleLeaderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(moduleLeaderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module leader ID',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const moduleLeader = await User.findById(moduleLeaderId);
    if (!moduleLeader) {
      return res.status(404).json({
        success: false,
        message: 'Module leader not found',
      });
    }

    course.moduleLeader = moduleLeaderId;
    await course.save();

    const updatedCourse = await Course.findById(courseId)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Module leader assigned successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error assigning module leader:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign module leader',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add prerequisites
export const addPrerequisites = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { prerequisiteIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Validate prerequisites
    const validPrerequisites = await Course.find({
      _id: { $in: prerequisiteIds },
    });
    if (validPrerequisites.length !== prerequisiteIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more prerequisites not found',
      });
    }

    await course.addPrerequisites(prerequisiteIds);

    const updatedCourse = await Course.findById(courseId)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Prerequisites added successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error adding prerequisites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add prerequisites',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove prerequisites
export const removePrerequisites = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { prerequisiteIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await course.removePrerequisites(prerequisiteIds);

    const updatedCourse = await Course.findById(courseId)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Prerequisites removed successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error removing prerequisites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove prerequisites',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Search courses
export const searchCourses = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const courses = await Course.search(q);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search courses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get course statistics
export const getCourseStatistics = async (req: Request, res: Response) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ isActive: true });
    const inactiveCourses = await Course.countDocuments({ isActive: false });

    const coursesByDepartment = await Course.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          departmentName: { $first: '$departmentInfo.name' },
        },
      },
      {
        $project: {
          department: '$departmentName',
          count: 1,
        },
      },
    ]);

    const coursesBySemester = await Course.aggregate([
      {
        $match: { semester: { $exists: true, $ne: null } },
      },
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          semester: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCourses,
        activeCourses,
        inactiveCourses,
        coursesByDepartment,
        coursesBySemester,
      },
    });
  } catch (error) {
    console.error('Error fetching course statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Bulk create courses
export const bulkCreateCourses = async (req: Request, res: Response) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Courses array is required',
      });
    }

    const createdCourses = [];
    const errors = [];

    for (const courseData of courses) {
      try {
        // Validate required fields
        if (!courseData.name || !courseData.code || !courseData.description || 
            !courseData.creditHours || !courseData.department || !courseData.moduleLeader) {
          errors.push(`Course ${courseData.code}: Missing required fields`);
          continue;
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code: courseData.code.toUpperCase() });
        if (existingCourse) {
          errors.push(`Course ${courseData.code}: Course code already exists`);
          continue;
        }

        const course = new Course({
          ...courseData,
          code: courseData.code.toUpperCase(),
          createdBy: req.user?.id,
        });

        await course.save();
        createdCourses.push(course);
      } catch (error) {
        errors.push(`Course ${courseData.code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const populatedCourses = await Course.find({
      _id: { $in: createdCourses.map(c => c._id) },
    })
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdCourses.length} courses`,
      data: populatedCourses,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error bulk creating courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create courses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Export courses
export const exportCourses = async (req: Request, res: Response) => {
  try {
    const { department, year, semester, isActive, search } = req.query;

    const filter: any = {};

    if (department) filter.department = department;
    if (year) filter.year = year;
    if (semester) filter.semester = semester;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    let query = Course.find(filter)
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name email');

    if (search) {
      query = Course.find({
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { code: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      })
        .populate('department', 'name code')
        .populate('moduleLeader', 'name email')
        .populate('prerequisites', 'name code')
        .populate('createdBy', 'name email');
    }

    const courses = await query.sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = courses.map(course => ({
      'Course Code': course.code,
      'Course Name': course.name,
      'Description': course.description,
      'Credit Hours': course.creditHours,
      'Department': course.department?.name || '',
      'Module Leader': course.moduleLeader?.name || '',
      'Module Leader Email': course.moduleLeader?.email || '',
      'Year': course.year || '',
      'Semester': course.semester || '',
      'Status': course.isActive ? 'Active' : 'Inactive',
      'Created At': course.createdAt.toISOString(),
    }));

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=courses.csv');

    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    res.send(csvString);
  } catch (error) {
    console.error('Error exporting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export courses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
