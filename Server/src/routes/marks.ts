import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as marksController from '../controllers/marksController';
import { createQuestionFormatSchema, updateQuestionFormatSchema, createStudentMarksSchema, updateStudentMarksSchema, bulkImportStudentMarksSchema } from '../schemas/marks';

const router = express.Router();

// All routes require authentication
router.use(authenticate);


// Student Marks routes
router.get('/students/format/:formatId', marksController.getStudentMarksByFormat);
router.get('/students/type/:examType', marksController.getStudentMarksByType);
router.get('/students/id/:studentId', marksController.getStudentMarksByStudentId);
router.get('/students/summary/:studentId', marksController.getStudentMarksSummary);
router.get('/students/:id', marksController.getStudentMarksById);
router.post('/students', validateRequest(createStudentMarksSchema), marksController.createStudentMarks);
router.put('/students/:id', validateRequest(updateStudentMarksSchema), marksController.updateStudentMarks);
router.delete('/students/:id', marksController.deleteStudentMarks);
router.post('/students/bulk-import', validateRequest(bulkImportStudentMarksSchema), marksController.bulkImportStudentMarks);

export default router;
