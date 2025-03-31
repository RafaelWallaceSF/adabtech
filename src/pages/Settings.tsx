
import { UserManagement } from "@/components/settings/UserManagement";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default Settings;
