
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Team, Evaluation } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';

interface TeamEvaluationFormProps {
  team: Team;
}

const TeamEvaluationForm = ({ team }: TeamEvaluationFormProps) => {
  const { user } = useAuth();
  const { criteria, evaluations, addEvaluation } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState({
    innovation: 0,
    techComplexity: 0,
    design: 0,
    completion: 0,
    presentation: 0,
  });
  const [comments, setComments] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if this team has already been evaluated by this judge
  useEffect(() => {
    if (user) {
      const existingEvaluation = evaluations.find(
        e => e.teamId === team.id && e.judgeId === user.id
      );
      
      if (existingEvaluation) {
        setScores(existingEvaluation.scores);
        setComments(existingEvaluation.comments || '');
        setTotalScore(existingEvaluation.totalScore || 0);
        setIsSubmitted(true);
      }
    }
  }, [evaluations, team.id, user]);

  // Calculate total score whenever scores change
  useEffect(() => {
    const newTotal = Object.values(scores).reduce((sum, score) => sum + score, 0);
    setTotalScore(newTotal);
  }, [scores]);

  const handleScoreChange = (category: keyof typeof scores, value: number[]) => {
    setScores({ ...scores, [category]: value[0] });
  };

  const handleSubmit = () => {
    if (!user) return;

    addEvaluation({
      teamId: team.id,
      judgeId: user.id,
      scores,
      comments,
      totalScore,
    });
    
    setIsSubmitted(true);
    setIsOpen(false);
    
    toast({
      title: "Evaluation Submitted",
      description: `Your evaluation for ${team.name} has been saved.`,
    });
  };

  return (
    <Card className={`card-shadow ${isSubmitted ? 'border-hackathon-success border-2' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{team.name}</CardTitle>
            <CardDescription>{team.projectName}</CardDescription>
          </div>
          {isSubmitted && (
            <div className="flex items-center text-hackathon-success">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Evaluated</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm">{team.projectDescription}</p>
          
          <div>
            <h4 className="font-medium mb-1">Team Members</h4>
            <ul className="text-sm space-y-1">
              {team.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
          
          {isSubmitted ? (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Your Evaluation</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-sm">Innovation:</span>
                  <span className="ml-2 font-medium">{scores.innovation}/20</span>
                </div>
                <div>
                  <span className="text-sm">Technical Complexity:</span>
                  <span className="ml-2 font-medium">{scores.techComplexity}/20</span>
                </div>
                <div>
                  <span className="text-sm">Design:</span>
                  <span className="ml-2 font-medium">{scores.design}/20</span>
                </div>
                <div>
                  <span className="text-sm">Completion:</span>
                  <span className="ml-2 font-medium">{scores.completion}/20</span>
                </div>
                <div>
                  <span className="text-sm">Presentation:</span>
                  <span className="ml-2 font-medium">{scores.presentation}/20</span>
                </div>
                <div>
                  <span className="text-sm font-bold">Total Score:</span>
                  <span className="ml-2 font-bold">{totalScore}/100</span>
                </div>
              </div>
              
              {comments && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Comments:</h4>
                  <p className="text-sm">{comments}</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsSubmitted(false)}
              >
                Edit Evaluation
              </Button>
            </div>
          ) : (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <Button className="w-full">
                  {isSubmitted ? 'Edit Evaluation' : 'Start Evaluation'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-6">
                {criteria.map((criterion) => {
                  const key = criterion.name.toLowerCase().replace(/ /g, '') as keyof typeof scores;
                  const mappedKey = key === 'innovation' ? 'innovation' :
                                   key === 'technicalcomplexity' ? 'techComplexity' :
                                   key === 'design' ? 'design' :
                                   key === 'completion' ? 'completion' : 'presentation';
                  
                  return (
                    <div key={criterion.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{criterion.name}</Label>
                        <span className="text-sm font-medium">{scores[mappedKey]}/{criterion.maxScore}</span>
                      </div>
                      <Slider
                        value={[scores[mappedKey]]}
                        max={criterion.maxScore}
                        step={1}
                        onValueChange={(value) => handleScoreChange(mappedKey, value)}
                      />
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    </div>
                  );
                })}
                
                <div className="space-y-2">
                  <Label htmlFor={`comments-${team.id}`}>Comments (Optional)</Label>
                  <Textarea
                    id={`comments-${team.id}`}
                    placeholder="Enter any additional feedback for this team"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Total Score</h4>
                    <p className="text-lg font-bold">{totalScore}/100</p>
                  </div>
                  <Button onClick={handleSubmit}>
                    Submit Evaluation
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamEvaluationForm;
