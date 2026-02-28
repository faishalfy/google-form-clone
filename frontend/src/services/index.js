/**
 * Services Index
 * 
 * This file exports all services for easy importing.
 * Instead of: import { login } from '../services/authService'
 * You can do: import { authService } from '../services'
 * 
 * BEGINNER TIP:
 * - All API-related logic is centralized in services
 * - Components should use services, not make direct API calls
 * - This keeps components focused on UI logic
 * 
 * LEVEL 4 Updates:
 * - Added submissionService for analytics
 * - Added sectionService for multi-section forms
 */

import * as authService from './authService';
import * as formService from './formService';
import * as questionService from './questionService';
import * as responseService from './responseService';
import * as submissionService from './submissionService';
import * as sectionService from './sectionService';
import api from './api';

export { 
  authService, 
  formService, 
  questionService, 
  responseService, 
  submissionService,
  sectionService,
  api 
};
