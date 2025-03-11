
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-primary">404</h1>
        <p className="text-2xl font-bold text-foreground mb-4">Página não encontrada</p>
        <p className="text-muted-foreground mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
