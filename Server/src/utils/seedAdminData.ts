import mongoose from 'mongoose';
import User from '../models/User';
import Department from '../models/Department';
import Course from '../models/Course';
import Batch from '../models/Batch';
import Section from '../models/Section';

export const seedAdminData = async () => {
  try {
    // Check if admin user exists
    let admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      // Create admin user
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@smartmarks.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Check if departments exist
    const departmentCount = await Department.countDocuments();
    if (departmentCount === 0) {
      // Create sample departments
      const departments = [
        {
          name: 'Computer Science',
          code: 'CS',
          description: 'Department of Computer Science and Engineering',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Electrical Engineering',
          code: 'EE',
          description: 'Department of Electrical and Electronic Engineering',
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Business Administration',
          code: 'BBA',
          description: 'Department of Business Administration',
          isActive: true,
          createdBy: admin._id
        }
      ];

      const createdDepartments = await Department.insertMany(departments);
      console.log('Sample departments created');

      // Create sample courses
      const courses = [
        {
          name: 'Introduction to Programming',
          code: 'CS101',
          description: 'Basic programming concepts and problem solving',
          creditHours: 3,
          department: createdDepartments[0]._id,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Data Structures',
          code: 'CS201',
          description: 'Fundamental data structures and algorithms',
          creditHours: 3,
          department: createdDepartments[0]._id,
          prerequisites: [],
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Circuit Analysis',
          code: 'EE101',
          description: 'Basic electrical circuit analysis',
          creditHours: 4,
          department: createdDepartments[1]._id,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Marketing Principles',
          code: 'BBA101',
          description: 'Introduction to marketing concepts',
          creditHours: 3,
          department: createdDepartments[2]._id,
          isActive: true,
          createdBy: admin._id
        }
      ];

      const createdCourses = await Course.insertMany(courses);
      console.log('Sample courses created');

      // Create sample batches
      const batches = [
        {
          name: 'Spring 2024',
          year: 2024,
          semester: 'Spring',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-05-15'),
          department: createdDepartments[0]._id,
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Fall 2024',
          year: 2024,
          semester: 'Fall',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-20'),
          department: createdDepartments[0]._id,
          isActive: true,
          createdBy: admin._id
        }
      ];

      const createdBatches = await Batch.insertMany(batches);
      console.log('Sample batches created');

      // Create sample sections
      const sections = [
        {
          name: 'Section A',
          batch: createdBatches[0]._id,
          course: createdCourses[0]._id,
          maxStudents: 40,
          currentStudents: 25,
          schedule: [
            {
              day: 'Monday',
              startTime: '09:00',
              endTime: '10:30',
              room: 'Room 101'
            },
            {
              day: 'Wednesday',
              startTime: '09:00',
              endTime: '10:30',
              room: 'Room 101'
            }
          ],
          isActive: true,
          createdBy: admin._id
        },
        {
          name: 'Section B',
          batch: createdBatches[0]._id,
          course: createdCourses[1]._id,
          maxStudents: 35,
          currentStudents: 30,
          schedule: [
            {
              day: 'Tuesday',
              startTime: '11:00',
              endTime: '12:30',
              room: 'Room 102'
            },
            {
              day: 'Thursday',
              startTime: '11:00',
              endTime: '12:30',
              room: 'Room 102'
            }
          ],
          isActive: true,
          createdBy: admin._id
        }
      ];

      await Section.insertMany(sections);
      console.log('Sample sections created');
    }

    console.log('Admin data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding admin data:', error);
    throw error;
  }
};
