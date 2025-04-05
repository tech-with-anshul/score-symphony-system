
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'judge';
  name?: string;
  email?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  projectName: string;
  projectDescription: string;
  evaluations?: Evaluation[];
  totalScore?: number;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  assignedTeams?: string[];
}

export interface Evaluation {
  id: string;
  teamId: string;
  judgeId: string;
  scores: {
    innovation: number;
    techComplexity: number;
    design: number;
    completion: number;
    presentation: number;
  };
  comments?: string;
  totalScore?: number;
  submittedAt: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

export interface AppState {
  user: User | null;
  teams: Team[];
  judges: Judge[];
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;
}
