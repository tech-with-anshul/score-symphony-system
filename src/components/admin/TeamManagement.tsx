
import { useState } from 'react';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Team } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const TeamManagement = () => {
  const { teams, addTeam, removeTeam, uploadTeams } = useData();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    projectName: '',
    projectDescription: '',
    members: [''],
  });

  const handleMemberChange = (index: number, value: string) => {
    const updatedMembers = [...newTeam.members];
    updatedMembers[index] = value;
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const addMemberField = () => {
    setNewTeam({ ...newTeam, members: [...newTeam.members, ''] });
  };

  const removeMemberField = (index: number) => {
    if (newTeam.members.length <= 1) return;
    const updatedMembers = newTeam.members.filter((_, i) => i !== index);
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const handleSubmit = () => {
    if (!newTeam.name || !newTeam.projectName || newTeam.members.some(m => !m)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addTeam({
      name: newTeam.name,
      projectName: newTeam.projectName,
      projectDescription: newTeam.projectDescription,
      members: newTeam.members.filter(m => m),
    });
    
    setNewTeam({
      name: '',
      projectName: '',
      projectDescription: '',
      members: [''],
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
        const data = JSON.parse(content) as Team[];
        
        if (!Array.isArray(data)) {
          throw new Error("Uploaded file must contain an array of teams");
        }
        
        // Validate each team
        data.forEach(team => {
          if (!team.name || !team.projectName || !Array.isArray(team.members)) {
            throw new Error(`Invalid team data format`);
          }
        });
        
        // Add IDs if missing
        const teamsWithIds = data.map(team => ({
          ...team,
          id: team.id || crypto.randomUUID(),
        }));
        
        uploadTeams(teamsWithIds);
        
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
        <h2 className="text-2xl font-bold">Team Management</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team
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

      {teams.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No teams added yet</p>
          <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="card-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>{team.projectName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Project Description</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{team.projectDescription}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Team Members</h4>
                  <ul className="text-sm space-y-1">
                    {team.members.map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => removeTeam(team.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Team
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Enter the details for the new team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newTeam.projectName}
                onChange={(e) => setNewTeam({ ...newTeam, projectName: e.target.value })}
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                value={newTeam.projectDescription}
                onChange={(e) => setNewTeam({ ...newTeam, projectDescription: e.target.value })}
                placeholder="Enter project description"
                className="resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Team Members</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMemberField}>
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Member
                </Button>
              </div>
              
              {newTeam.members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={member}
                    onChange={(e) => handleMemberChange(index, e.target.value)}
                    placeholder={`Member ${index + 1} name`}
                  />
                  {newTeam.members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMemberField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
