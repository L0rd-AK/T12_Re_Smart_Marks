import mongoose from 'mongoose';
import User from '../models/User';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import Section from '../models/Section';
import Course from '../models/Course';
import Department from '../models/Department';
import Batch from '../models/Batch';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestData = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODBURL;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if test data already exists
    const existingRequests = await CourseAccessRequest.countDocuments();
    if (existingRequests > 0) {
      console.log('Test data already exists, skipping...');
      return;
    }

    // Create or find a department
    let department = await Department.findOne({ code: 'CS' });
    if (!department) {
      department = new Department({
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science',
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });
      await department.save();
      console.log('Department created');
    }

    // Create or find a course
    let course = await Course.findOne({ code: 'CS101' });
    if (!course) {
      course = new Course({
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts',
        creditHours: 3,
        department: department._id,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });
      await course.save();
      console.log('Course created');
    }

    // Create or find a batch
    let batch = await Batch.findOne({ name: 'Spring 2024' });
    if (!batch) {
      batch = new Batch({
        name: 'Spring 2024',
        year: 2024,
        semester: 'Spring',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        department: department._id,
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });
      await batch.save();
      console.log('Batch created');
    }

    // Create module leader user
    let moduleLeader = await User.findOne({ email: 'moduleleader@test.com' });
    if (!moduleLeader) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      moduleLeader = new User({
        name: 'John ModuleLeader',
        email: 'moduleleader@test.com',
        password: hashedPassword,
        employeeId: 'ML001',
        designation: 'Module Leader',
        role: 'module-leader',
        isEmailVerified: true
      });
      await moduleLeader.save();
      console.log('Module leader created');
    }

    // Create teacher user
    let teacher = await User.findOne({ email: 'teacher@test.com' });
    if (!teacher) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      teacher = new User({
        name: 'Jane Teacher',
        email: 'teacher@test.com',
        password: hashedPassword,
        employeeId: 'T001',
        designation: 'Assistant Professor',
        role: 'teacher',
        isEmailVerified: true
      });
      await teacher.save();
      console.log('Teacher created');
    }

    // Create section with module leader
    let section = await Section.findOne({ 
      course: course._id, 
      moduleLeader: moduleLeader._id 
    });
    if (!section) {
      section = new Section({
        name: 'Section A',
        batch: batch._id,
        course: course._id,
        moduleLeader: moduleLeader._id,
        maxStudents: 40,
        currentStudents: 25,
        isActive: true,
        createdBy: moduleLeader._id
      });
      await section.save();
      console.log('Section with module leader created');
    }

    // Create course access request
    const accessRequest = new CourseAccessRequest({
      course: course._id,
      teacher: teacher._id,
      moduleLeader: moduleLeader._id,
      message: 'I would like to request access to teach this programming course. I have 5 years of experience in software development and have taught similar courses before.',
      status: 'pending'
    });
    await accessRequest.save();
    console.log('Course access request created');

    // Create another request with different status
    const approvedRequest = new CourseAccessRequest({
      course: course._id,
      teacher: new mongoose.Types.ObjectId(), // Different teacher ID
      moduleLeader: moduleLeader._id,
      message: 'Request for course access as I am qualified to teach this subject.',
      status: 'approved',
      responseDate: new Date(),
      responseMessage: 'Approved based on qualifications and experience.',
      respondedBy: moduleLeader._id
    });
    await approvedRequest.save();
    console.log('Approved course access request created');

    console.log('Test data created successfully!');
    console.log('You can now test the /api/teacher-requests route');
    console.log('Login as moduleleader@test.com with password: password123');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  createTestData();
}

export default createTestData;
