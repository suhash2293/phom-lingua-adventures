
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [selectedModule, setSelectedModule] = useState('vocabulary');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // If not logged in or not admin, redirect to home
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would upload to Supabase
    toast({
      title: "Lesson Created",
      description: `Lesson "${lessonTitle}" was created for the ${selectedModule} module.`,
    });
    
    // Reset form
    setLessonTitle('');
    setLessonContent('');
    setAudioFile(null);
  };
  
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };
  
  const handleAddVocabulary = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Vocabulary Added",
      description: "New vocabulary words have been added to the database.",
    });
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="lessons" className="mb-8">
        <TabsList>
          <TabsTrigger value="lessons">Manage Lessons</TabsTrigger>
          <TabsTrigger value="vocabulary">Add Vocabulary</TabsTrigger>
          <TabsTrigger value="audio">Upload Audio</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Lesson</CardTitle>
              <CardDescription>Create a new lesson for any learning module</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddLesson}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="pronunciation">Pronunciation</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="conversation">Conversation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Lesson Title</Label>
                  <Input
                    id="title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Enter lesson title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Lesson Content</Label>
                  <Textarea
                    id="content"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="Enter lesson content (supports markdown)"
                    required
                    className="min-h-32"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audio">Audio Files (optional)</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                  />
                  {audioFile && (
                    <p className="text-sm text-muted-foreground">
                      File selected: {audioFile.name}
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit">Add Lesson</Button>
              </CardFooter>
            </form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Existing Lessons</CardTitle>
              <CardDescription>Manage and edit current lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-12 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  This would show a list of existing lessons that can be edited or deleted.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vocabulary Tab */}
        <TabsContent value="vocabulary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Vocabulary</CardTitle>
              <CardDescription>Add new words and phrases to the database</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddVocabulary}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phom-word">Phom Word</Label>
                    <Input id="phom-word" placeholder="Enter word in Phom" className="phom-font" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="english-word">English Translation</Label>
                    <Input id="english-word" placeholder="Enter English translation" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue="greetings">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greetings">Greetings</SelectItem>
                        <SelectItem value="numbers">Numbers</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="food">Food & Drink</SelectItem>
                        <SelectItem value="everyday">Everyday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="example-sentence">Example Sentence (optional)</Label>
                  <Input id="example-sentence" placeholder="Example sentence using this word" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vocab-audio">Audio File (optional)</Label>
                  <Input id="vocab-audio" type="file" accept="audio/*" />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit">Add Vocabulary</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio Files</CardTitle>
              <CardDescription>Upload pronunciation guides and lesson audio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-files">Select Audio Files</Label>
                <Input id="audio-files" type="file" accept="audio/*" multiple />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audio-module">Associated Module</Label>
                <Select defaultValue="vocabulary">
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="pronunciation">Pronunciation</SelectItem>
                    <SelectItem value="grammar">Grammar</SelectItem>
                    <SelectItem value="conversation">Conversation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audio-description">Description</Label>
                <Textarea id="audio-description" placeholder="Description of these audio files" />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button>Upload Audio Files</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-12 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  This would show a list of users that can be managed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
