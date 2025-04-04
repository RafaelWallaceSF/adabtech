import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export type ProjectAttachment = {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: Date;
  createdBy: string | null;
};

interface FileUploadResponse {
  success: boolean;
  attachment?: ProjectAttachment;
  error?: string;
}

export const uploadProjectFile = async (
  projectId: string,
  file: File
): Promise<FileUploadResponse> => {
  try {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `${projectId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('project_attachments')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error("Erro ao fazer upload do arquivo:", uploadError);
      return { success: false, error: uploadError.message };
    }
    
    const { data: attachmentData, error: attachmentError } = await supabase
      .rpc('insert_project_attachment', {
        p_project_id: projectId,
        p_file_name: file.name,
        p_file_path: filePath,
        p_file_type: file.type,
        p_file_size: file.size
      })
      .single();
    
    if (attachmentError || !attachmentData) {
      console.error("Erro ao registrar anexo:", attachmentError);
      
      await supabase.storage
        .from('project_attachments')
        .remove([filePath]);
      
      return { success: false, error: attachmentError?.message || 'Falha ao salvar os dados do anexo' };
    }
    
    const attachment: ProjectAttachment = {
      id: attachmentData.id,
      projectId: attachmentData.project_id,
      fileName: attachmentData.file_name,
      filePath: attachmentData.file_path,
      fileType: attachmentData.file_type,
      fileSize: attachmentData.file_size,
      createdAt: new Date(attachmentData.created_at),
      createdBy: attachmentData.created_by
    };
    
    return { success: true, attachment };
  } catch (error) {
    console.error("Exceção ao fazer upload de arquivo:", error);
    return { success: false, error: 'Erro interno ao processar o arquivo' };
  }
};

export const uploadMultipleFiles = async (
  projectId: string,
  files: File[]
): Promise<{
  success: boolean;
  attachments: ProjectAttachment[];
  failures: { file: string; error: string }[];
}> => {
  const results: ProjectAttachment[] = [];
  const failures: { file: string; error: string }[] = [];

  for (const file of files) {
    try {
      const result = await uploadProjectFile(projectId, file);
      
      if (result.success && result.attachment) {
        results.push(result.attachment);
      } else {
        failures.push({ 
          file: file.name, 
          error: result.error || 'Erro desconhecido' 
        });
      }
    } catch (error) {
      console.error(`Erro ao processar arquivo ${file.name}:`, error);
      failures.push({ 
        file: file.name, 
        error: 'Exceção ao processar o arquivo' 
      });
    }
  }

  return {
    success: results.length > 0,
    attachments: results,
    failures
  };
};

export const getProjectAttachments = async (projectId: string): Promise<ProjectAttachment[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_project_attachments', {
        p_project_id: projectId
      });
    
    if (error || !data) {
      console.error("Erro ao buscar anexos:", error);
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.id,
      projectId: item.project_id,
      fileName: item.file_name,
      filePath: item.file_path,
      fileType: item.file_type,
      fileSize: item.file_size,
      createdAt: new Date(item.created_at),
      createdBy: item.created_by
    }));
  } catch (error) {
    console.error("Exceção ao buscar anexos:", error);
    return [];
  }
};

export const deleteProjectAttachment = async (attachment: ProjectAttachment): Promise<boolean> => {
  try {
    const { error: storageError } = await supabase.storage
      .from('project_attachments')
      .remove([attachment.filePath]);
    
    if (storageError) {
      console.error("Erro ao remover arquivo do storage:", storageError);
      return false;
    }
    
    const { error: dbError } = await supabase
      .rpc('delete_project_attachment', {
        p_attachment_id: attachment.id
      });
    
    if (dbError) {
      console.error("Erro ao remover registro de anexo:", dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exceção ao excluir anexo:", error);
    return false;
  }
};

export const getFileUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('project_attachments')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
