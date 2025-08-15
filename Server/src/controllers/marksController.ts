import { Request, Response } from 'express';
import { QuestionFormat, StudentMarks } from '../models/Marks';


// Student Marks Controllers
export const getStudentMarksByFormat = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.find({
            formatId: req.params.formatId,
            createdBy: req.user._id
        }).populate('formatId');

        res.json(marks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
        return;
    }
};

export const getStudentMarksByStudentId = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.find({
            studentId: req.params.studentId,
            createdBy: req.user._id
        }).populate('formatId');

        res.json(marks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
        return;
    }
};

export const getStudentMarksSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.find({
            studentId: req.params.studentId,
            createdBy: req.user._id
        }).populate('formatId');

        if (marks.length === 0) {
            res.status(404).json({ message: 'No marks found for this student' });
            return;
        }

        // Group by exam type and calculate statistics
        const groupedMarks = marks.reduce((acc: Record<string, any[]>, mark: any) => {
            if (!acc[mark.examType]) {
                acc[mark.examType] = [];
            }
            acc[mark.examType].push({
                id: mark._id,
                formatName: mark.formatId?.name || 'Simple Mark',
                total: mark.total,
                createdAt: mark.createdAt
            });
            return acc;
        }, {});

        // Structure the response to match client expectations
        const summary = {
            studentId: req.params.studentId,
            name: marks[0].name || req.params.studentId,
            quizzes: {
                count: groupedMarks.quiz?.length || 0,
                marks: groupedMarks.quiz || [],
                average: groupedMarks.quiz ? groupedMarks.quiz.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.quiz.length : 0,
                weight: 10, // Default weight
                weightedScore: 0
            },
            midterms: {
                count: groupedMarks.midterm?.length || 0,
                marks: groupedMarks.midterm || [],
                average: groupedMarks.midterm ? groupedMarks.midterm.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.midterm.length : 0,
                weight: 25,
                weightedScore: 0
            },
            finals: {
                count: groupedMarks.final?.length || 0,
                marks: groupedMarks.final || [],
                average: groupedMarks.final ? groupedMarks.final.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.final.length : 0,
                weight: 35,
                weightedScore: 0
            },
            assignments: {
                count: groupedMarks.assignment?.length || 0,
                marks: groupedMarks.assignment || [],
                average: groupedMarks.assignment ? groupedMarks.assignment.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.assignment.length : 0,
                weight: 15,
                weightedScore: 0
            },
            presentations: {
                count: groupedMarks.presentation?.length || 0,
                marks: groupedMarks.presentation || [],
                average: groupedMarks.presentation ? groupedMarks.presentation.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.presentation.length : 0,
                weight: 10,
                weightedScore: 0
            },
            attendance: {
                count: groupedMarks.attendance?.length || 0,
                marks: groupedMarks.attendance || [],
                average: groupedMarks.attendance ? groupedMarks.attendance.reduce((sum: number, m: any) => sum + m.total, 0) / groupedMarks.attendance.length : 0,
                weight: 5,
                weightedScore: 0
            }
        };

        // Calculate weighted scores (ensure they exist even if no marks)
        summary.quizzes.weightedScore = summary.quizzes.average > 0 ? (summary.quizzes.average * summary.quizzes.weight) / 100 : 0;
        summary.midterms.weightedScore = summary.midterms.average > 0 ? (summary.midterms.average * summary.midterms.weight) / 100 : 0;
        summary.finals.weightedScore = summary.finals.average > 0 ? (summary.finals.average * summary.finals.weight) / 100 : 0;
        summary.assignments.weightedScore = summary.assignments.average > 0 ? (summary.assignments.average * summary.assignments.weight) / 100 : 0;
        summary.presentations.weightedScore = summary.presentations.average > 0 ? (summary.presentations.average * summary.presentations.weight) / 100 : 0;
        summary.attendance.weightedScore = summary.attendance.average > 0 ? (summary.attendance.average * summary.attendance.weight) / 100 : 0;

        // Calculate overall statistics
        const totalWeightedScore = summary.quizzes.weightedScore + summary.midterms.weightedScore + 
                                 summary.finals.weightedScore + summary.assignments.weightedScore + 
                                 summary.presentations.weightedScore + summary.attendance.weightedScore;
        
        const totalWeight = summary.quizzes.weight + summary.midterms.weight + summary.finals.weight + 
                           summary.assignments.weight + summary.presentations.weight + summary.attendance.weight;

        const finalGrade = (totalWeightedScore / totalWeight) * 100;
        
        // Calculate total marks across all assessments
        const totalMarks = (summary.quizzes.marks.length ? summary.quizzes.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0) +
                          (summary.midterms.marks.length ? summary.midterms.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0) +
                          (summary.finals.marks.length ? summary.finals.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0) +
                          (summary.assignments.marks.length ? summary.assignments.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0) +
                          (summary.presentations.marks.length ? summary.presentations.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0) +
                          (summary.attendance.marks.length ? summary.attendance.marks.reduce((sum: number, m: any) => sum + m.total, 0) : 0);

        const totalAssessments = summary.quizzes.count + summary.midterms.count + summary.finals.count + 
                               summary.assignments.count + summary.presentations.count + summary.attendance.count;

        const overallAverage = totalAssessments > 0 ? totalMarks / totalAssessments : 0;

        // Add overall object to summary
        (summary as any).overall = {
            totalMarks: totalMarks,
            average: overallAverage,
            finalGrade: finalGrade,
            gradeBreakdown: {
                quiz: `${summary.quizzes.weightedScore.toFixed(2)}/${summary.quizzes.weight}`,
                midterm: `${summary.midterms.weightedScore.toFixed(2)}/${summary.midterms.weight}`,
                final: `${summary.finals.weightedScore.toFixed(2)}/${summary.finals.weight}`,
                assignment: `${summary.assignments.weightedScore.toFixed(2)}/${summary.assignments.weight}`,
                presentation: `${summary.presentations.weightedScore.toFixed(2)}/${summary.presentations.weight}`,
                attendance: `${summary.attendance.weightedScore.toFixed(2)}/${summary.attendance.weight}`
            }
        };

        res.json(summary);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
};

export const getStudentMarksById = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        }).populate('formatId');

        if (!marks) {
            res.status(404).json({ message: 'Student marks not found' });
            return;
        }

        res.json(marks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
        return;
    }
};

export const createStudentMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        
        // Calculate total from marks array
        const total = req.body.marks.reduce((sum: number, mark: number) => sum + mark, 0);
        
        const marks = new StudentMarks({
            ...req.body,
            total,
            createdBy: req.user._id
        });

        const savedMarks = await marks.save();
        res.status(201).json(savedMarks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message: 'Error creating student marks', error: errorMessage });
    }
};

export const updateStudentMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        
        // Calculate total from marks array
        const total = req.body.marks ? req.body.marks.reduce((sum: number, mark: number) => sum + mark, 0) : undefined;
        
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        
        if (total !== undefined) {
            updateData.total = total;
        }
        
        const marks = await StudentMarks.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            updateData,
            { new: true }
        );

        if (!marks) {
            res.status(404).json({ message: 'Student marks not found' });
            return;
        }

        res.json(marks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message: 'Error updating student marks', error: errorMessage });
    }
};

export const deleteStudentMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!marks) {
            res.status(404).json({ message: 'Student marks not found' });
            return;
        }

        res.json({ message: 'Student marks deleted successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
        return;
    }
};

export const bulkImportStudentMarks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const { studentsData, formatId, examType } = req.body;

        const marksArray = studentsData.map((student: any) => {
            const total = student.marks.reduce((sum: number, mark: number) => sum + mark, 0);
            return {
                name: student.name,
                studentId: student.studentId,
                marks: student.marks,
                total,
                examType,
                formatId: formatId || undefined,
                createdBy: req.user!._id,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        });

        const savedMarks = await StudentMarks.insertMany(marksArray);
        res.status(201).json(savedMarks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message: 'Error importing student marks', error: errorMessage });
    }
};

export const getStudentMarksByType = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const marks = await StudentMarks.find({
            examType: req.params.examType,
            createdBy: req.user._id
        }).populate('formatId');

        res.json(marks);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
        return;
    }
};
