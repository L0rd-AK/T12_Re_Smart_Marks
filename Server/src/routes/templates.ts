import { Router } from 'express';
<<<<<<< HEAD
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createTemplateSchema, updateTemplateSchema } from '../schemas/templates';
import { templatesController } from '../controllers/templatesController';
=======
import { templatesController } from '../controllers/templatesController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createTemplateSchema, updateTemplateSchema } from '../schemas/templates';
>>>>>>> 5066c4c3ecae49c9f7637bbc78c5a525bf9b0f75

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create template
router.post('/', validateRequest(createTemplateSchema), templatesController.createTemplate);

// Get all templates
router.get('/', templatesController.getTemplates);

// Get midterm templates for teachers/users
router.get('/midterm', templatesController.getMidtermTemplates);

// Get final templates for teachers/users  
router.get('/final', templatesController.getFinalTemplates);

// Get template by ID
router.get('/:id', templatesController.getTemplateById);

// Update template
router.put('/:id', validateRequest(updateTemplateSchema), templatesController.updateTemplate);

// Delete template
router.delete('/:id', templatesController.deleteTemplate);

// Copy template
router.post('/:id/copy', templatesController.copyTemplate);

export default router;
