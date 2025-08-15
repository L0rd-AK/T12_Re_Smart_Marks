const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Course = require('./src/models/Course');
const Department = require('./src/models/Department');
const User = require('./src/models/User');

async function createTestData() {
  try {
    // Create a test department
    const department = await Department.create({
      name: 'Computer Science',
      code: 'CSE',
      description: 'Computer Science and Engineering Department',
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });

    // Create a test user (module leader)
    const moduleLeader = await User.create({
      name: 'Dr. Alice Johnson',
      email: 'alice.johnson@university.edu',
      password: 'password123',
      role: 'module-leader',
      department: department._id,
      isActive: true
    });

    // Create test courses
    const courses = await Course.create([
      {
        name: 'Introduction to Programming',
        code: 'CSE101',
        description: 'Basic programming concepts and practices',
        creditHours: 3,
        department: department._id,
        prerequisites: [],
        isActive: true,
        createdBy: moduleLeader._id,
        moduleLeader: moduleLeader._id,
        year: '2025',
        semester: 'spring'
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CSE201',
        description: 'Advanced data structures and algorithm analysis',
        creditHours: 4,
        department: department._id,
        prerequisites: [],
        isActive: true,
        createdBy: moduleLeader._id,
        moduleLeader: moduleLeader._id,
        year: '2025',
        semester: 'spring'
      },
      {
        name: 'Object Oriented Programming',
        code: 'CSE202',
        description: 'Object-oriented programming concepts and design patterns',
        creditHours: 3,
        department: department._id,
        prerequisites: [],
        isActive: true,
        createdBy: moduleLeader._id,
        moduleLeader: moduleLeader._id,
        year: '2024',
        semester: 'fall'
      },
      {
        name: 'Database Management Systems',
        code: 'CSE301',
        description: 'Database design, implementation, and management',
        creditHours: 3,
        department: department._id,
        prerequisites: [],
        isActive: true,
        createdBy: moduleLeader._id,
        moduleLeader: moduleLeader._id,
        year: '2024',
        semester: 'summer'
      }
    ]);

    console.log('Test data created successfully!');
    console.log('Department:', department.name);
    console.log('Module Leader:', moduleLeader.name);
    console.log('Courses created:', courses.length);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error creating test data:', error);
    await mongoose.connection.close();
  }
}

createTestData();

