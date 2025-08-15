import { Schema, model, Types } from 'mongoose';
export const semesterEnum = { Spring: 'Spring', Summer: 'Summer', Fall: 'Fall' };
const CourseAccessSchema = new Schema({
    semester: {
        type: String,
        enum: semesterEnum,
        ref: 'Semester',
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    course: {
        type: Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    teachers: [{
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    batch: {
        type: Number,
        ref: 'Batch',
        required: true,
    },
    moduleLeader: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed'],
        default: 'ongoing',
    }, sections: {
        type: [String],
        default: [],
    }
}, { timestamps: true });

export default model('CourseAccess', CourseAccessSchema);