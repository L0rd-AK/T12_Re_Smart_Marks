import mongoose from 'mongoose';
import User from '../models/User';
import Section from '../models/Section';
import Course from '../models/Course';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import dotenv from 'dotenv';

dotenv.config();

const fixModuleLeaderAssignments = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODBURL;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== FIXING MODULE LEADER ASSIGNMENTS ===\n');

    // Find the module leader user
    const moduleLeader = await User.findOne({ email: 'moduleleader@gmail.com' });
    if (!moduleLeader) {
      console.log('Module leader user not found!');
      return;
    }
    console.log(`Found module leader: ${moduleLeader.name} (${moduleLeader._id})`);

    // Find all sections that don't have a module leader
    const sectionsWithoutModuleLeader = await Section.find({ 
      moduleLeader: { $exists: false } 
    }).populate('course', 'name code');

    console.log(`\nFound ${sectionsWithoutModuleLeader.length} sections without module leader:`);
    sectionsWithoutModuleLeader.forEach(section => {
      console.log(`- ${section.name} - Course: ${(section.course as any)?.name || 'Unknown'}`);
    });

    // Assign module leader to sections
    if (sectionsWithoutModuleLeader.length > 0) {
      const updateResult = await Section.updateMany(
        { moduleLeader: { $exists: false } },
        { $set: { moduleLeader: moduleLeader._id } }
      );
      console.log(`\nUpdated ${updateResult.modifiedCount} sections with module leader`);
    }

    // Verify the updates
    const updatedSections = await Section.find({}).select('name course moduleLeader').populate('course', 'name code').populate('moduleLeader', 'name email');
    console.log('\nAll sections after update:');
    updatedSections.forEach(section => {
      console.log(`- ${section.name} - Course: ${(section.course as any)?.name || 'Unknown'} - Module Leader: ${(section.moduleLeader as any)?.name || 'None'}`);
    });

    // Check course access requests for this module leader
    const moduleLeaderRequests = await CourseAccessRequest.find({ 
      moduleLeader: moduleLeader._id 
    }).populate('course', 'name code').populate('teacher', 'name email');
    
    console.log(`\nCourse access requests for module leader (${moduleLeader.name}):`);
    if (moduleLeaderRequests.length === 0) {
      console.log('NO REQUESTS FOUND for this module leader!');
    } else {
      moduleLeaderRequests.forEach(request => {
        console.log(`- Course: ${(request.course as any)?.name || 'Unknown'} - Teacher: ${(request.teacher as any)?.name || 'Unknown'} - Status: ${request.status}`);
      });
    }

    console.log('\n=== MODULE LEADER ASSIGNMENTS FIXED ===\n');

  } catch (error) {
    console.error('Error fixing module leader assignments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  fixModuleLeaderAssignments();
}

export default fixModuleLeaderAssignments;
