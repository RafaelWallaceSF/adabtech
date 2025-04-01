
// This file re-exports all Supabase-related services
import { mapSupabaseProject, mapSupabasePayment, mapSupabaseTask, mapSupabaseUser } from './supabase/mappers';
import { 
  updateProjectStatus, 
  updateProject, 
  fetchProjects, 
  fetchProjectWithDetails, 
  createProject, 
  deleteProject 
} from './supabase/projectService';
import { 
  createPayment, 
  markPaymentAsPaid, 
  deletePayment, 
  enableRealtimeForPayments 
} from './supabase/paymentService';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask 
} from './supabase/taskService';
import { 
  fetchUsers, 
  fetchClients 
} from './supabase/clientUserService';
import {
  uploadProjectFile,
  getProjectAttachments,
  deleteProjectAttachment,
  getFileUrl
} from './supabase/attachmentService';

// Re-export everything
export {
  // Mappers
  mapSupabaseProject,
  mapSupabasePayment,
  mapSupabaseTask,
  mapSupabaseUser,
  
  // Project operations
  updateProjectStatus,
  updateProject,
  fetchProjects,
  fetchProjectWithDetails,
  createProject,
  deleteProject,
  
  // Payment operations
  createPayment,
  markPaymentAsPaid,
  deletePayment,
  enableRealtimeForPayments,
  
  // Task operations
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  
  // Client & User operations
  fetchUsers,
  fetchClients,
  
  // Attachment operations
  uploadProjectFile,
  getProjectAttachments,
  deleteProjectAttachment,
  getFileUrl
};
