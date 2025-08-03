import { Request, Response } from 'express';
import Template, { ITemplate } from '../models/Template';
import { CreateTemplateRequest, UpdateTemplateRequest } from '../schemas/templates';

export const templatesController = {
  // Create a new template
  createTemplate: async (req: Request, res: Response) => {
    try {
      const templateData: CreateTemplateRequest = req.body;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const template = new Template({
        ...templateData,
        createdBy: req.user._id,
      });

      await template.save();

      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ message: 'Failed to create template' });
    }
  },

  // Get all templates
  getTemplates: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const templates = await Template.find({
        $or: [
          { createdBy: req.user._id },
          { isStandard: true }
        ]
      }).sort({ createdAt: -1 });

      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  },

  // Get template by ID
  getTemplateById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const template = await Template.findOne({
        _id: id,
        $or: [
          { createdBy: req.user._id },
          { isStandard: true }
        ]
      });

      if (!template) {
        res.status(404).json({ message: 'Template not found' });
        return;
      }

      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ message: 'Failed to fetch template' });
    }
  },

  // Update template
  updateTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateTemplateRequest = req.body;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const template = await Template.findOneAndUpdate(
        {
          _id: id,
          createdBy: req.user._id
        },
        updateData,
        { new: true, runValidators: true }
      );

      if (!template) {
        res.status(404).json({ message: 'Template not found or access denied' });
        return;
      }

      res.json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ message: 'Failed to update template' });
    }
  },

  // Delete template
  deleteTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const template = await Template.findOneAndDelete({
        _id: id,
        createdBy: req.user._id
      });

      if (!template) {
        res.status(404).json({ message: 'Template not found or access denied' });
        return;
      }

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ message: 'Failed to delete template' });
    }
  },

  // Copy template
  copyTemplate: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const originalTemplate = await Template.findOne({
        _id: id,
        $or: [
          { createdBy: req.user._id },
          { isStandard: true }
        ]
      });

      if (!originalTemplate) {
        res.status(404).json({ message: 'Template not found' });
        return;
      }

      const copiedTemplate = new Template({
        name: `${originalTemplate.name} (Copy)`,
        type: originalTemplate.type,
        year: originalTemplate.year,
        courseName: originalTemplate.courseName,
        courseCode: originalTemplate.courseCode,
        description: originalTemplate.description,
        questions: originalTemplate.questions,
        duration: originalTemplate.duration,
        instructions: originalTemplate.instructions,
        isStandard: false,
        createdBy: req.user._id,
      });

      await copiedTemplate.save();

      res.status(201).json(copiedTemplate);
    } catch (error) {
      console.error('Error copying template:', error);
      res.status(500).json({ message: 'Failed to copy template' });
    }
  },
};
