import mongoose from 'mongoose';
import User from '../models/User';
import Section from '../models/Section';
import dotenv from 'dotenv';

dotenv.config();

const simpleFix = async () => {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODBURL;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    console.log('\n=== SIMPLE FIX FOR MODULE LEADER ASSIGNMENTS ===\n');

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
    });

    console.log(`\nFound ${sectionsWithoutModuleLeader.length} sections without module leader:`);
    sectionsWithoutModuleLeader.forEach(section => {
      console.log(`- ${section.name} (ID: ${section._id})`);
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
    const allSections = await Section.find({}).select('name moduleLeader');
    console.log('\nAll sections after update:');
    allSections.forEach(section => {
      console.log(`- ${section.name} - Module Leader: ${section.moduleLeader || 'None'}`);
    });

    console.log('\n=== FIX COMPLETED ===\n');
    console.log('Now try the /api/teacher-requests route again!');

  } catch (error) {
    console.error('Error in simple fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  simpleFix();
}

export default simpleFix;
