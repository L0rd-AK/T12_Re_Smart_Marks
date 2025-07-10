import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  label: string;
  maxMark: number;
}

export interface IQuestionFormat extends Document {
  name: string;
  questions: IQuestion[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentMarks extends Document {
  name: string;
  studentId: string;
  formatId?: mongoose.Types.ObjectId; // Optional for simple marks
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'presentation' | 'attendance';
  marks: number[];
  total: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Question Format Schema
const questionFormatSchema = new Schema<IQuestionFormat>(
  {
    name: {
      type: String,
      required: [true, 'Format name is required'],
      trim: true,
      minlength: [2, 'Format name must be at least 2 characters'],
      maxlength: [100, 'Format name must be less than 100 characters']
    },
    questions: [
      {
        label: {
          type: String,
          required: [true, 'Question label is required'],
          trim: true
        },
        maxMark: {
          type: Number,
          required: [true, 'Maximum mark is required'],
          min: [0, 'Maximum mark cannot be negative']
        }
      }
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Student Marks Schema
const studentMarksSchema = new Schema<IStudentMarks>(
  {
    name: {
      type: String,
      required: false, // Made optional for some exam types
      trim: true
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      index: true // Add index for faster querying
    },
    formatId: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionFormat',
      required: false // Made optional for simple marks
    },
    examType: {
      type: String,
      enum: ['quiz', 'midterm', 'final', 'assignment', 'presentation', 'attendance'],
      required: [true, 'Exam type is required']
    },
    marks: {
      type: [Number],
      required: true,
      validate: {
        validator: function(marks: number[]) {
          return marks.every(mark => mark >= 0);
        },
        message: 'Marks cannot be negative'
      }
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Pre-save hook to calculate total if not provided
studentMarksSchema.pre('save', function(next) {
  if (this.isModified('marks') || this.isModified('total')) {
    // If total is not provided or marks have changed, calculate it
    if (!this.total || this.isModified('marks')) {
      this.total = this.marks.reduce((sum, mark) => sum + mark, 0);
    }
  }
  next();
});

export const QuestionFormat = mongoose.model<IQuestionFormat>('QuestionFormat', questionFormatSchema);
export const StudentMarks = mongoose.model<IStudentMarks>('StudentMarks', studentMarksSchema);
