
import { useState } from 'react';
import { AlertCircle, BarChart2, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ResultsView = () => {
  const { teams, judges, evaluations, resetEvaluations, calculateFinalScores } = useData();
  const [sortBy, setSortBy] = useState<'highest' | 'lowest'>('highest');
  
  const rankedTeams = calculateFinalScores().sort((a, b) => {
    const scoreA = a.totalScore || 0;
    const scoreB = b.totalScore || 0;
    return sortBy === 'highest' ? scoreB - scoreA : scoreA - scoreB;
  });

  const getEvaluationStatusByTeam = (teamId: string) => {
    const judgeIds = judges.map(judge => judge.id);
    const completedEvaluations = evaluations.filter(
      e => e.teamId === teamId
    ).map(e => e.judgeId);
    
    const completedCount = completedEvaluations.length;
    const totalJudges = judgeIds.length;
    
    return {
      completed: completedCount,
      total: totalJudges,
      percentage: totalJudges ? Math.round((completedCount / totalJudges) * 100) : 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Evaluation Results</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'highest' | 'lowest')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest Score</SelectItem>
              <SelectItem value="lowest">Lowest Score</SelectItem>
            </SelectContent>
          </Select>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Evaluations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all evaluation data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetEvaluations}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{teams.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Judges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{judges.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Evaluations Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{evaluations.length} / {teams.length * judges.length}</p>
          </CardContent>
        </Card>
      </div>

      {evaluations.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Evaluations Yet</h3>
          <p className="text-muted-foreground mt-2">
            No evaluations have been submitted by the judges.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border shadow">
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                Final Rankings
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-24 text-right">Score</TableHead>
                  <TableHead className="hidden md:table-cell">Evaluation Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedTeams.map((team, index) => {
                  const status = getEvaluationStatusByTeam(team.id);
                  
                  return (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.projectName}</TableCell>
                      <TableCell className="font-medium text-right">
                        {team.totalScore !== undefined ? team.totalScore : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={status.percentage} className="h-2" />
                          <span className="text-xs whitespace-nowrap">
                            {status.completed}/{status.total}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Detailed Evaluation Breakdown</h3>
            <div className="space-y-8">
              {rankedTeams.map(team => (
                <Card key={team.id} className="overflow-hidden card-shadow">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex justify-between items-center">
                      <span>{team.name} - {team.projectName}</span>
                      <span className="text-lg">Total: {team.totalScore || 0}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Judge</TableHead>
                          <TableHead className="text-center">Innovation</TableHead>
                          <TableHead className="text-center">Technical</TableHead>
                          <TableHead className="text-center">Design</TableHead>
                          <TableHead className="text-center">Completion</TableHead>
                          <TableHead className="text-center">Presentation</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.evaluations?.map(evaluation => {
                          const judge = judges.find(j => j.id === evaluation.judgeId);
                          return (
                            <TableRow key={evaluation.id}>
                              <TableCell>{judge?.name || 'Unknown Judge'}</TableCell>
                              <TableCell className="text-center">{evaluation.scores.innovation}</TableCell>
                              <TableCell className="text-center">{evaluation.scores.techComplexity}</TableCell>
                              <TableCell className="text-center">{evaluation.scores.design}</TableCell>
                              <TableCell className="text-center">{evaluation.scores.completion}</TableCell>
                              <TableCell className="text-center">{evaluation.scores.presentation}</TableCell>
                              <TableCell className="text-right font-medium">{evaluation.totalScore}</TableCell>
                            </TableRow>
                          );
                        })}
                        {!team.evaluations?.length && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                              No evaluations yet for this team
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsView;
