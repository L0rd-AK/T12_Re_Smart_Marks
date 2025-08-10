import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  questionNo: string;
  marks: number;
  courseOutcomeStatements?: string;
}

export interface ITemplate extends Document {
  name: string;
  type: 'quiz' | 'midterm' | 'final';
  year: string;
  courseName: string;
  courseCode: string;
  description: string;
  questions: IQuestion[];
  totalMarks: number;
  duration: number;
  instructions: string;
  isStandard: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  createdBy: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  questionNo: { type: String, required: true },
  marks: { type: Number, required: true, min: 0 },
  courseOutcomeStatements: { type: String },
}, { _id: false });

const templateSchema = new Schema<ITemplate>({
  name: { type: String, required: true },
  type: { type: String, enum: ['quiz', 'midterm', 'final'], required: true },
  year: { type: String, required: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  description: { type: String, required: true },
  questions: [questionSchema],
  totalMarks: { type: Number, default: 0 },
  duration: { type: Number, required: true, min: 1 },
  instructions: { type: String, default: '' },
  isStandard: { type: Boolean, default: false },
  lastUsed: { type: Date },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

// Calculate total marks before saving
templateSchema.pre('save', function(this: ITemplate) {
  this.totalMarks = this.questions.reduce((total, question) => total + question.marks, 0);
});

const Template = mongoose.model<ITemplate>('Template', templateSchema);

export default Template;