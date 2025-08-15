import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import Course from '../models/Course';
const router = express.Router();


router.use(authenticate);

// Course Routes
router.get('/courses', asyncHandler(async (req: Request, res: Response) => {
    const { department } = req.query;

    const filter: any = {};
    if (department) {
        filter.department = department;
    }

    const courses = await Course.find(filter)
        .populate('department', 'name code')
        .populate('moduleLeader', 'name email role')
        .populate('prerequisites', 'name code')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    res.json(courses);
}));

router.get('/courses/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError('Invalid course ID', 400);
    }

    const course = await Course.findById(id)
        .populate('department', 'name code')
        .populate('moduleLeader', 'name email role')
        .populate('prerequisites', 'name code')
        .populate('createdBy', 'name');

    if (!course) {
        throw createError('Course not found', 404);
    }

    res.json(course);
}));

export default router;