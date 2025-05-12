
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // This would update the user profile in a real implementation
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  // Mock learning stats
  const learningStats = {
    totalLessons: 12,
    completedLessons: 3,
    totalVocabulary: 160,
    learnedVocabulary: 35,
    streak: 5,
    lastActive: "2023-05-10",
  };
  
  const progressPercentage = Math.round((learningStats.completedLessons / learningStats.totalLessons) * 100);
  const vocabPercentage = Math.round((learningStats.learnedVocabulary / learningStats.totalVocabulary) * 100);
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language-preference">Learning Language Preference</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="phom-english"
                      name="language-preference"
                      defaultChecked
                    />
                    <label htmlFor="phom-english">Phom to English</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="english-phom"
                      name="language-preference"
                    />
                    <label htmlFor="english-phom">English to Phom</label>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit">Update Profile</Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Learning Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Your achievements so far</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {learningStats.completedLessons} of {learningStats.totalLessons} lessons completed
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Vocabulary</span>
                <span className="text-sm font-medium">{vocabPercentage}%</span>
              </div>
              <Progress value={vocabPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {learningStats.learnedVocabulary} of {learningStats.totalVocabulary} words learned
              </p>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Learning Streak</p>
                <p className="text-xl font-bold">{learningStats.streak} days</p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Active</p>
                <p className="text-muted-foreground">{learningStats.lastActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
