import mongoose from 'mongoose';
import User from '../models/User';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import Section from '../models/Section';
import Course from '../models/Course';
import Department from '../models/Department';
import Batch from '../models/Batch';
import dotenv from 'dotenv';

dotenv.config();

const debugDatabase = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODBURL;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== DATABASE DEBUG INFO ===\n');

    // Check users
    const users = await User.find({}).select('name email role employeeId');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Employee ID: ${user.employeeId}`);
    });

    // Check departments
    const departments = await Department.find({}).select('name code');
    console.log('\nDepartments in database:');
    departments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.code})`);
    });

    // Check courses
    const courses = await Course.find({}).select('name code department').populate('department', 'name code');
    console.log('\nCourses in database:');
    courses.forEach(course => {
      console.log(`- ${course.name} (${course.code}) - Department: ${(course.department as any)?.name || 'Unknown'}`);
    });

    // Check batches
    const batches = await Batch.find({}).select('name year semester department').populate('department', 'name code');
    console.log('\nBatches in database:');
    batches.forEach(batch => {
      console.log(`- ${batch.name} (${batch.semester} ${batch.year}) - Department: ${(batch.department as any)?.name || 'Unknown'}`);
    });

    // Check sections
    const sections = await Section.find({}).select('name course moduleLeader batch').populate('course', 'name code').populate('moduleLeader', 'name email').populate('batch', 'name semester year');
    console.log('\nSections in database:');
    sections.forEach(section => {
      console.log(`- ${section.name} - Course: ${(section.course as any)?.name || 'Unknown'} - Module Leader: ${(section.moduleLeader as any)?.name || 'None'} - Batch: ${(section.batch as any)?.name || 'Unknown'}`);
    });

    // Check course access requests
    const requests = await CourseAccessRequest.find({}).select('course teacher moduleLeader status message').populate('course', 'name code').populate('teacher', 'name email').populate('moduleLeader', 'name email');
    console.log('\nCourse Access Requests in database:');
    requests.forEach(request => {
      console.log(`- Course: ${(request.course as any)?.name || 'Unknown'} - Teacher: ${(request.teacher as any)?.name || 'Unknown'} - Module Leader: ${(request.moduleLeader as any)?.name || 'Unknown'} - Status: ${request.status}`);
    });

    // Check specific module leader
    const moduleLeader = await User.findOne({ email: 'moduleleader@gmail.com' });
    if (moduleLeader) {
      console.log(`\nModule Leader found: ${moduleLeader.name} (${moduleLeader._id})`);
      
      // Check requests for this module leader
      const moduleLeaderRequests = await CourseAccessRequest.find({ 
        moduleLeader: moduleLeader._id 
      }).populate('course', 'name code').populate('teacher', 'name email');
      
      console.log(`\nRequests for this module leader (${moduleLeader.name}):`);
      if (moduleLeaderRequests.length === 0) {
        console.log('NO REQUESTS FOUND for this module leader!');
      } else {
        moduleLeaderRequests.forEach(request => {
          console.log(`- Course: ${(request.course as any)?.name || 'Unknown'} - Teacher: ${(request.teacher as any)?.name || 'Unknown'} - Status: ${request.status}`);
        });
      }
    } else {
      console.log('\nModule leader user not found!');
    }

    console.log('\n=== END DEBUG INFO ===\n');

  } catch (error) {
    console.error('Error debugging database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  debugDatabase();
}

export default debugDatabase;
