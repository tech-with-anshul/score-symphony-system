
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import TeamEvaluationForm from '@/components/judge/TeamEvaluationForm';
import JudgeEvaluations from '@/components/judge/JudgeEvaluations';

const JudgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const { user, logout } = useAuth();
  const { teams, judges, getEvaluationsByJudge } = useData();
  const navigate = useNavigate();

  const currentJudge = judges.find(judge => judge.id === user?.id || judge.email === user?.email);
  const judgeEvaluations = user ? getEvaluationsByJudge(user.id) : [];
  
  // Get only teams that are assigned to this judge
  const assignedTeams = teams.filter(
    team => currentJudge?.assignedTeams?.includes(team.id) || !currentJudge?.assignedTeams?.length
  );
  
  // Count how many evaluations this judge has completed
  const completedEvaluations = judgeEvaluations.length;
  const totalAssigned = assignedTeams.length;
  const remainingEvaluations = totalAssigned - completedEvaluations;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Judge Dashboard</h1>
          <p className="text-muted-foreground">
            Evaluate teams and track your submitted evaluations
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <p className="text-sm font-medium">
            Logged in as {user?.name || currentJudge?.name || user?.username}
          </p>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Assigned Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignedTeams.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Completed Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedEvaluations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{remainingEvaluations}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-8">
          <TabsTrigger value="teams">Evaluate Teams</TabsTrigger>
          <TabsTrigger value="evaluations">My Evaluations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="mt-4">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Teams to Evaluate</h2>
            
            {assignedTeams.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No teams have been assigned to you</p>
              </div>
            ) : (
              <div className="space-y-8">
                {assignedTeams.map((team) => (
                  <TeamEvaluationForm key={team.id} team={team} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="evaluations" className="mt-4">
          <JudgeEvaluations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JudgeDashboard;
