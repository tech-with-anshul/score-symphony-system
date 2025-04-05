
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'judge'>('judge');
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const success = await login(username, password, role);
    
    if (success) {
      toast({
        title: "Success",
        description: `Logged in as ${role}`,
      });
      navigate(role === 'admin' ? '/admin' : '/judge');
    } else {
      toast({
        title: "Login Failed",
        description: error || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto card-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in to Hackathon Evaluation System</CardTitle>
        <CardDescription>
          Enter your credentials to access the evaluation system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Login as</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as 'admin' | 'judge')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="judge" id="judge" />
                <Label htmlFor="judge">Judge</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Administrator</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button type="submit" className="w-full gradient-bg" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>Demo Credentials - Admin: admin/admin123 | Judge: judge1/judge123</p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
