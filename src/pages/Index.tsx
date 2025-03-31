
import { useEffect, useState } from "react";
import { fetchProjects } from "@/services/supabaseService";
import { Project } from "@/types";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Failed to load projects. Please try again later.");
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Projects Overview</h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects available. Create your first project to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-muted-foreground">Client: {project.client}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {project.status}
                  </span>
                  <span className="font-medium">R$ {project.totalValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
