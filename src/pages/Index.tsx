
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, UserCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/judge');
    }
  }, [isAuthenticated, user, navigate, mounted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hackathon-primary/5 to-hackathon-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">
              LAKSHAGRIHA HACKATHON 4.0
            </h1>
            <p className="text-xl text-hackathon-foreground/80 max-w-xl">
              Streamline your hackathon judging process with our comprehensive evaluation platform designed for organizers and judges.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex gap-3 items-start">
                <div className="bg-hackathon-primary text-white p-3 rounded-lg">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Fair Evaluation</h3>
                  <p className="text-sm text-hackathon-foreground/70">Standardized judging criteria ensures consistent and fair team evaluations.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="bg-hackathon-secondary text-white p-3 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Management</h3>
                  <p className="text-sm text-hackathon-foreground/70">Easily add, update, and organize participating teams and projects.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="bg-hackathon-accent text-white p-3 rounded-lg">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Judge Assignment</h3>
                  <p className="text-sm text-hackathon-foreground/70">Assign judges to specific teams and track their evaluation progress.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="bg-hackathon-dark text-white p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Results</h3>
                  <p className="text-sm text-hackathon-foreground/70">View and analyze results as they come in with detailed scoring breakdowns.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
