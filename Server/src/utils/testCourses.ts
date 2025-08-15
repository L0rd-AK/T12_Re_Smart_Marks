import mongoose from 'mongoose';
import Course from '../models/Course';
import Section from '../models/Section';
import User from '../models/User';
import Department from '../models/Department';
import dotenv from 'dotenv';

dotenv.config();

const testCourses = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODBURL;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== TESTING COURSES API ===\n');

    // Test 1: Check if courses exist
    const courses = await Course.find({});
    console.log('All courses in database:');
    courses.forEach(course => {
      console.log(`- ${course.name} (${course.code}) - Department ID: ${course.department}`);
    });

    // Test 2: Check if sections exist
    const sections = await Section.find({});
    console.log('\nAll sections in database:');
    sections.forEach(section => {
      console.log(`- ${section.name} - Course ID: ${section.course} - Module Leader ID: ${section.moduleLeader}`);
    });

    // Test 3: Test the getDepartmentCourses logic
    console.log('\nTesting getDepartmentCourses logic:');
    
    // Get all active courses
    const allCourses = await Course.find({ isActive: true });
    
    console.log(`Found ${allCourses.length} active courses`);

    // Test with a sample user ID (you can replace this with an actual user ID)
    const sampleUserId = new mongoose.Types.ObjectId();
    
    const coursesWithAccess = await Promise.all(
      allCourses.map(async (course) => {
        const sections = await Section.find({ course: course._id });

        const hasAccess = sections.some(section => 
          section.instructor?.toString() === sampleUserId.toString() ||
          section.moduleLeader?.toString() === sampleUserId.toString()
        );

        return {
          id: course._id,
          code: course.code,
          title: course.name,
          department: course.department,
          creditHours: course.creditHours,
          status: course.isActive ? 'active' : 'inactive',
          hasAccess
        };
      })
    );

    console.log('\nProcessed courses:');
    coursesWithAccess.forEach(course => {
      console.log(`- ${course.code}: ${course.title} (Access: ${course.hasAccess})`);
    });

    console.log('\n=== END TEST ===\n');

  } catch (error) {
    console.error('Error testing courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  testCourses();
}

export default testCourses;
