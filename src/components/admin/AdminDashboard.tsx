
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamManagement from '@/components/admin/TeamManagement';
import JudgeManagement from '@/components/admin/JudgeManagement';
import ResultsView from '@/components/admin/ResultsView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Administrator Dashboard</h1>
          <p className="text-muted-foreground">Manage teams, judges, and view evaluation results</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <p className="text-sm font-medium">Logged in as {user?.name || user?.username}</p>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="teams" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="judges">Judges</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="mt-4">
          <TeamManagement />
        </TabsContent>
        
        <TabsContent value="judges" className="mt-4">
          <JudgeManagement />
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <ResultsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
