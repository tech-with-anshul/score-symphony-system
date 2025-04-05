
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Judge, Evaluation, EvaluationCriteria } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  teams: Team[];
  judges: Judge[];
  evaluations: Evaluation[];
  criteria: EvaluationCriteria[];
  isLoading: boolean;
  error: string | null;
  uploadTeams: (teamsData: Team[]) => void;
  uploadJudges: (judgesData: Judge[]) => void;
  addTeam: (team: Omit<Team, 'id'>) => void;
  addJudge: (judge: Omit<Judge, 'id'>) => void;
  removeTeam: (teamId: string) => void;
  removeJudge: (judgeId: string) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'submittedAt'>) => void;
  resetEvaluations: () => void;
  getTeamById: (teamId: string) => Team | undefined;
  getJudgeById: (judgeId: string) => Judge | undefined;
  getEvaluationsByTeam: (teamId: string) => Evaluation[];
  getEvaluationsByJudge: (judgeId: string) => Evaluation[];
  calculateFinalScores: () => Team[];
}

// Mock data
const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Team Alpha',
    members: ['John Doe', 'Jane Smith', 'Alex Johnson'],
    projectName: 'EcoTrack',
    projectDescription: 'An app to track and reduce carbon footprint',
  },
  {
    id: '2',
    name: 'Team Beta',
    members: ['Mike Brown', 'Sarah Lee', 'David Wang'],
    projectName: 'MedConnect',
    projectDescription: 'A telemedicine platform for rural communities',
  },
  {
    id: '3',
    name: 'Team Gamma',
    members: ['Lisa Chen', 'Tom Wilson', 'Rajiv Patel'],
    projectName: 'StudyBuddy',
    projectDescription: 'AI-powered study assistant for students',
  },
];

const mockJudges: Judge[] = [
  {
    id: '1',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.r@example.com',
    assignedTeams: ['1', '2', '3'],
  },
  {
    id: '2',
    name: 'Prof. Robert Kim',
    email: 'robert.k@example.com',
    assignedTeams: ['1', '2', '3'],
  },
];

const mockEvaluations: Evaluation[] = [];

const evaluationCriteria: EvaluationCriteria[] = [
  {
    id: '1',
    name: 'Innovation',
    description: 'Originality and uniqueness of the idea',
    maxScore: 20,
  },
  {
    id: '2',
    name: 'Technical Complexity',
    description: 'Complexity and sophistication of technical implementation',
    maxScore: 20,
  },
  {
    id: '3',
    name: 'Design',
    description: 'User interface, experience, and visual appeal',
    maxScore: 20,
  },
  {
    id: '4',
    name: 'Completion',
    description: 'Level of completeness and polish',
    maxScore: 20,
  },
  {
    id: '5',
    name: 'Presentation',
    description: 'Quality of presentation and demo',
    maxScore: 20,
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [judges, setJudges] = useState<Judge[]>(mockJudges);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [criteria] = useState<EvaluationCriteria[]>(evaluationCriteria);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load data from localStorage on initialization
  useEffect(() => {
    const savedTeams = localStorage.getItem('hackathon_teams');
    const savedJudges = localStorage.getItem('hackathon_judges');
    const savedEvaluations = localStorage.getItem('hackathon_evaluations');

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedJudges) setJudges(JSON.parse(savedJudges));
    if (savedEvaluations) setEvaluations(JSON.parse(savedEvaluations));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hackathon_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('hackathon_judges', JSON.stringify(judges));
  }, [judges]);

  useEffect(() => {
    localStorage.setItem('hackathon_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  const uploadTeams = (teamsData: Team[]) => {
    try {
      setTeams(teamsData);
      toast({
        title: "Teams Uploaded",
        description: `Successfully uploaded ${teamsData.length} teams.`,
      });
    } catch (err) {
      setError('Failed to upload teams');
      toast({
        title: "Error",
        description: "Failed to upload teams",
        variant: "destructive",
      });
    }
  };

  const uploadJudges = (judgesData: Judge[]) => {
    try {
      setJudges(judgesData);
      toast({
        title: "Judges Uploaded",
        description: `Successfully uploaded ${judgesData.length} judges.`,
      });
    } catch (err) {
      setError('Failed to upload judges');
      toast({
        title: "Error",
        description: "Failed to upload judges",
        variant: "destructive",
      });
    }
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    try {
      const newTeam = { ...team, id: crypto.randomUUID() };
      setTeams(prev => [...prev, newTeam]);
      toast({
        title: "Team Added",
        description: `Successfully added team ${team.name}.`,
      });
    } catch (err) {
      setError('Failed to add team');
      toast({
        title: "Error",
        description: "Failed to add team",
        variant: "destructive",
      });
    }
  };

  const addJudge = (judge: Omit<Judge, 'id'>) => {
    try {
      const newJudge = { ...judge, id: crypto.randomUUID() };
      setJudges(prev => [...prev, newJudge]);
      toast({
        title: "Judge Added",
        description: `Successfully added judge ${judge.name}.`,
      });
    } catch (err) {
      setError('Failed to add judge');
      toast({
        title: "Error",
        description: "Failed to add judge",
        variant: "destructive",
      });
    }
  };

  const removeTeam = (teamId: string) => {
    try {
      setTeams(prev => prev.filter(team => team.id !== teamId));
      // Also remove evaluations for this team
      setEvaluations(prev => prev.filter(evaluation => evaluation.teamId !== teamId));
      toast({
        title: "Team Removed",
        description: "Successfully removed team and associated evaluations.",
      });
    } catch (err) {
      setError('Failed to remove team');
      toast({
        title: "Error",
        description: "Failed to remove team",
        variant: "destructive",
      });
    }
  };

  const removeJudge = (judgeId: string) => {
    try {
      setJudges(prev => prev.filter(judge => judge.id !== judgeId));
      // Also remove evaluations by this judge
      setEvaluations(prev => prev.filter(evaluation => evaluation.judgeId !== judgeId));
      toast({
        title: "Judge Removed",
        description: "Successfully removed judge and associated evaluations.",
      });
    } catch (err) {
      setError('Failed to remove judge');
      toast({
        title: "Error",
        description: "Failed to remove judge",
        variant: "destructive",
      });
    }
  };

  const addEvaluation = (evaluation: Omit<Evaluation, 'id' | 'submittedAt'>) => {
    try {
      // Calculate total score for the evaluation
      const totalScore = Object.values(evaluation.scores).reduce((sum, score) => sum + score, 0);
      
      const newEvaluation: Evaluation = {
        ...evaluation,
        id: crypto.randomUUID(),
        totalScore,
        submittedAt: new Date().toISOString(),
      };
      
      // Check if an evaluation by this judge for this team already exists
      const existingIndex = evaluations.findIndex(
        e => e.judgeId === evaluation.judgeId && e.teamId === evaluation.teamId
      );
      
      if (existingIndex >= 0) {
        // Update existing evaluation
        const updatedEvaluations = [...evaluations];
        updatedEvaluations[existingIndex] = newEvaluation;
        setEvaluations(updatedEvaluations);
      } else {
        // Add new evaluation
        setEvaluations(prev => [...prev, newEvaluation]);
      }
      
      toast({
        title: "Evaluation Submitted",
        description: "Successfully saved evaluation.",
      });
    } catch (err) {
      setError('Failed to add evaluation');
      toast({
        title: "Error",
        description: "Failed to save evaluation",
        variant: "destructive",
      });
    }
  };

  const resetEvaluations = () => {
    try {
      setEvaluations([]);
      toast({
        title: "Evaluations Reset",
        description: "All evaluation data has been cleared.",
      });
    } catch (err) {
      setError('Failed to reset evaluations');
      toast({
        title: "Error",
        description: "Failed to reset evaluations",
        variant: "destructive",
      });
    }
  };

  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  const getJudgeById = (judgeId: string) => {
    return judges.find(judge => judge.id === judgeId);
  };

  const getEvaluationsByTeam = (teamId: string) => {
    return evaluations.filter(evaluation => evaluation.teamId === teamId);
  };

  const getEvaluationsByJudge = (judgeId: string) => {
    return evaluations.filter(evaluation => evaluation.judgeId === judgeId);
  };

  const calculateFinalScores = () => {
    return teams.map(team => {
      const teamEvaluations = getEvaluationsByTeam(team.id);
      
      if (teamEvaluations.length === 0) {
        return { ...team, totalScore: 0 };
      }
      
      const totalScore = teamEvaluations.reduce(
        (sum, evaluation) => sum + (evaluation.totalScore || 0), 
        0
      );
      
      return {
        ...team,
        evaluations: teamEvaluations,
        totalScore,
      };
    });
  };

  return (
    <DataContext.Provider
      value={{
        teams,
        judges,
        evaluations,
        criteria,
        isLoading,
        error,
        uploadTeams,
        uploadJudges,
        addTeam,
        addJudge,
        removeTeam,
        removeJudge,
        addEvaluation,
        resetEvaluations,
        getTeamById,
        getJudgeById,
        getEvaluationsByTeam,
        getEvaluationsByJudge,
        calculateFinalScores,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
