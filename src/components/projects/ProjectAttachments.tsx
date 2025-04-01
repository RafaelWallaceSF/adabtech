
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, File, Download, Trash2, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  ProjectAttachment, 
  getProjectAttachments, 
  uploadProjectFile, 
  deleteProjectAttachment,
  getFileUrl
} from "@/services/supabase/attachmentService";
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectAttachmentsProps {
  projectId: string;
}

export default function ProjectAttachments({ projectId }: ProjectAttachmentsProps) {
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttachments();
  }, [projectId]);

  const loadAttachments = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectAttachments(projectId);
      setAttachments(data);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      toast.error("Não foi possível carregar os anexos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo para upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Array para armazenar promessas de upload
    const uploadPromises: Promise<void>[] = [];
    const totalFiles = selectedFiles.length;
    let completedUploads = 0;
    
    // Para cada arquivo selecionado
    for (const file of selectedFiles) {
      const uploadPromise = uploadProjectFile(projectId, file)
        .then((response) => {
          completedUploads++;
          setUploadProgress(Math.round((completedUploads / totalFiles) * 100));
          
          if (response.success && response.attachment) {
            setAttachments(prev => [response.attachment!, ...prev]);
          } else {
            throw new Error(response.error || "Erro desconhecido no upload");
          }
        })
        .catch((error) => {
          console.error(`Erro no upload do arquivo ${file.name}:`, error);
          toast.error(`Falha no upload de ${file.name}`);
        });
      
      uploadPromises.push(uploadPromise);
    }
    
    try {
      // Aguardar todos os uploads
      await Promise.all(uploadPromises);
      toast.success(`${totalFiles} ${totalFiles === 1 ? 'arquivo enviado' : 'arquivos enviados'} com sucesso`);
      setSelectedFiles([]);
      setShowUploadDialog(false);
    } catch (error) {
      console.error("Erro durante o processo de upload:", error);
      toast.error("Ocorreram erros durante o upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachment: ProjectAttachment) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o arquivo "${attachment.fileName}"?`);
    
    if (confirmed) {
      try {
        const success = await deleteProjectAttachment(attachment);
        
        if (success) {
          setAttachments(prev => prev.filter(a => a.id !== attachment.id));
          toast.success("Arquivo excluído com sucesso");
        } else {
          toast.error("Não foi possível excluir o arquivo");
        }
      } catch (error) {
        console.error("Erro ao excluir arquivo:", error);
        toast.error("Erro ao excluir arquivo");
      }
    }
  };

  const renderFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-8 w-8 text-muted-foreground" />;
    
    if (fileType.startsWith('image/')) {
      return <File className="h-8 w-8 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <File className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File className="h-8 w-8 text-indigo-500" />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <File className="h-8 w-8 text-green-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Arquivos do projeto</CardTitle>
            <CardDescription>Gerencie os documentos e arquivos relacionados a este projeto</CardDescription>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload de Arquivos</DialogTitle>
                <DialogDescription>
                  Selecione os arquivos que deseja anexar a este projeto
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados'}
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${uploadProgress}%` }} 
                        />
                      </div>
                      <div className="text-xs text-center text-muted-foreground">
                        {uploadProgress}% completo
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <ArrowUpCircle className="h-4 w-4" />
                      Enviar Arquivos
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Carregando arquivos...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo anexado a este projeto</p>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(true)} 
              className="mt-4"
            >
              Adicionar arquivos
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div 
                key={attachment.id} 
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {renderFileIcon(attachment.fileType)}
                  <div className="space-y-1">
                    <div className="font-medium">{attachment.fileName}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">
                        {getFileExtension(attachment.fileName)}
                      </Badge>
                      {attachment.fileSize && (
                        <span>{formatFileSize(attachment.fileSize)}</span>
                      )}
                      <span>
                        {new Date(attachment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    asChild
                  >
                    <a 
                      href={getFileUrl(attachment.filePath)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(attachment)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
