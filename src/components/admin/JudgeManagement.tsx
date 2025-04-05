
import { useState } from 'react';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Judge } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const JudgeManagement = () => {
  const { judges, teams, addJudge, removeJudge, uploadJudges } = useData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newJudge, setNewJudge] = useState({
    name: '',
    email: '',
    assignedTeams: [] as string[],
  });

  const handleSubmit = () => {
    if (!newJudge.name || !newJudge.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Default to all teams if none selected
    const assignedTeams = newJudge.assignedTeams.length > 0 
      ? newJudge.assignedTeams 
      : teams.map(team => team.id);
    
    addJudge({
      name: newJudge.name,
      email: newJudge.email,
      assignedTeams,
    });
    
    setNewJudge({
      name: '',
      email: '',
      assignedTeams: [],
    });
    
    setIsAddDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as Judge[];
        
        if (!Array.isArray(data)) {
          throw new Error("Uploaded file must contain an array of judges");
        }
        
        // Validate each judge
        data.forEach(judge => {
          if (!judge.name || !judge.email) {
            throw new Error(`Invalid judge data format`);
          }
        });
        
        // Add IDs if missing
        const judgesWithIds = data.map(judge => ({
          ...judge,
          id: judge.id || crypto.randomUUID(),
          // Default to all teams if assignedTeams is missing
          assignedTeams: judge.assignedTeams || teams.map(team => team.id),
        }));
        
        uploadJudges(judgesWithIds);
        
      } catch (error) {
        toast({
          title: "Upload Error",
          description: error instanceof Error ? error.message : "Failed to parse JSON file",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Judge Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Judge
          </Button>
          
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 w-full cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload JSON
            </Button>
          </div>
        </div>
      </div>

      {judges.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No judges added yet</p>
          <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Judge
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {judges.map((judge) => (
            <Card key={judge.id} className="card-shadow">
              <CardHeader className="pb-3">
                <CardTitle>{judge.name}</CardTitle>
                <CardDescription>{judge.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Assigned Teams</h4>
                  <p className="text-sm text-muted-foreground">
                    {judge.assignedTeams?.length === teams.length
                      ? "All teams"
                      : judge.assignedTeams?.length
                      ? `${judge.assignedTeams.length} teams assigned`
                      : "No teams assigned"}
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => removeJudge(judge.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Judge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Judge</DialogTitle>
            <DialogDescription>
              Enter the details for the new judge
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="judge-name">Name</Label>
              <Input
                id="judge-name"
                value={newJudge.name}
                onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
                placeholder="Enter judge name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judge-email">Email</Label>
              <Input
                id="judge-email"
                type="email"
                value={newJudge.email}
                onChange={(e) => setNewJudge({ ...newJudge, email: e.target.value })}
                placeholder="Enter judge email"
              />
            </div>

            <div className="space-y-2">
              <Label>Assigned Teams</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Leave empty to assign all teams
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`team-${team.id}`}
                      className="form-checkbox h-4 w-4 text-primary"
                      checked={newJudge.assignedTeams.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewJudge({
                            ...newJudge,
                            assignedTeams: [...newJudge.assignedTeams, team.id]
                          });
                        } else {
                          setNewJudge({
                            ...newJudge,
                            assignedTeams: newJudge.assignedTeams.filter(id => id !== team.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`team-${team.id}`} className="text-sm cursor-pointer">
                      {team.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JudgeManagement;
