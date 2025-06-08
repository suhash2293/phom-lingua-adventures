import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import LearnLayout from '@/components/layout/LearnLayout';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';

// Mock learning data
const modules = [
  {
    id: 'alphabets',
    title: 'Alphabets',
    description: 'Learn the Phom alphabets and characters',
    emoji: '🔤',
    progress: 25,
    lessons: [
      { id: 'alpha-1', title: 'Basic Characters', completed: true },
      { id: 'alpha-2', title: 'Vowels & Consonants', completed: true },
      { id: 'alpha-3', title: 'Special Characters', completed: false },
      { id: 'alpha-4', title: 'Writing Practice', completed: false },
    ]
  },
  {
    id: 'numbers',
    title: 'Numbers',
    description: 'Master counting from 1 to 100 in Phom dialect',
    emoji: '🔢',
    progress: 10,
    lessons: [
      { id: 'num-1', title: 'Numbers 1-10', completed: true },
      { id: 'num-2', title: 'Numbers 11-50', completed: false },
      { id: 'num-3', title: 'Numbers 51-100', completed: false },
      { id: 'num-4', title: 'Ordinal Numbers', completed: false },
    ]
  },
  {
    id: 'days',
    title: 'Days',
    description: 'Learn the names of days in Phom dialect',
    emoji: '📅',
    progress: 0,
    lessons: [
      { id: 'day-1', title: 'Weekdays', completed: false },
      { id: 'day-2', title: 'Weekends', completed: false },
      { id: 'day-3', title: 'Time Expressions', completed: false },
      { id: 'day-4', title: 'Calendar Practice', completed: false },
    ]
  },
  {
    id: 'months',
    title: 'Months',
    description: 'Learn the names of months in Phom dialect',
    emoji: '🗓️',
    progress: 0,
    lessons: [
      { id: 'month-1', title: 'Months of the Year', completed: false },
      { id: 'month-2', title: 'Seasons', completed: false },
      { id: 'month-3', title: 'Festivals & Holidays', completed: false },
      { id: 'month-4', title: 'Date Expressions', completed: false },
    ]
  }
];

const LearnPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initializeAudioContext } = useAudioPreloader();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle module click - initialize audio context and navigate
  const handleModuleClick = (moduleId: string) => {
    // Initialize audio context on user interaction
    initializeAudioContext();
    // Navigate to the module page
    navigate(`/learn/${moduleId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Learning Modules</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-all border-primary/20 hover:border-primary">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <span className="mr-2">{module.emoji}</span>
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 pb-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2 bg-primary/10" />
                </div>
              </CardContent>
              
              <CardFooter className="bg-primary/5 rounded-b-lg">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleModuleClick(module.id)}
                >
                  {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </LearnLayout>
  );
};

export default LearnPage;
