
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const JudgeEvaluations = () => {
  const { user } = useAuth();
  const { getEvaluationsByJudge, getTeamById } = useData();
  
  const judgeEvaluations = user ? getEvaluationsByJudge(user.id) : [];
  
  // Sort evaluations by submission date (newest first)
  const sortedEvaluations = [...judgeEvaluations].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Evaluations</h2>
      
      {sortedEvaluations.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't submitted any evaluations yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Evaluation Summary</CardTitle>
              <CardDescription>
                You have submitted {sortedEvaluations.length} evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvaluations.map((evaluation) => {
                    const team = getTeamById(evaluation.teamId);
                    if (!team) return null;
                    
                    return (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.projectName}</TableCell>
                        <TableCell className="text-center">
                          {evaluation.totalScore}/100
                        </TableCell>
                        <TableCell className="text-right">
                          {format(new Date(evaluation.submittedAt), 'MMM d, h:mm a')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Detailed Evaluations</h3>
            
            {sortedEvaluations.map((evaluation) => {
              const team = getTeamById(evaluation.teamId);
              if (!team) return null;
              
              return (
                <Card key={evaluation.id} className="card-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex justify-between">
                      <span>{team.name} - {team.projectName}</span>
                      <span className="text-lg">{evaluation.totalScore}/100</span>
                    </CardTitle>
                    <CardDescription>
                      Submitted on {format(new Date(evaluation.submittedAt), 'MMMM d, yyyy h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Innovation</p>
                        <p className="font-semibold">{evaluation.scores.innovation}/20</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Technical Complexity</p>
                        <p className="font-semibold">{evaluation.scores.techComplexity}/20</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Design</p>
                        <p className="font-semibold">{evaluation.scores.design}/20</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Completion</p>
                        <p className="font-semibold">{evaluation.scores.completion}/20</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Presentation</p>
                        <p className="font-semibold">{evaluation.scores.presentation}/20</p>
                      </div>
                    </div>
                    
                    {evaluation.comments && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-1">Your Comments:</h4>
                        <p className="text-sm">{evaluation.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeEvaluations;
