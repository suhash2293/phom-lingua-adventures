
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
import { Skeleton } from '@/components/ui/skeleton';
import LearnLayout from '@/components/layout/LearnLayout';
import { useAudioPreloader } from '@/hooks/use-audio-preloader';
import { LearningProgressService } from '@/services/LearningProgressService';

// Module mapping with emojis and descriptions
const moduleConfig = {
  'Alphabets': {
    emoji: '🔤',
    description: 'Learn the Phom alphabets and characters',
    route: '/learn/alphabets'
  },
  'Numbers': {
    emoji: '🔢',
    description: 'Master counting from 1 to 100 in Phom dialect',
    route: '/learn/numbers'
  },
  'Days': {
    emoji: '📅',
    description: 'Learn the names of days in Phom dialect',
    route: '/learn/days'
  },
  'Months': {
    emoji: '🗓️',
    description: 'Learn the names of months in Phom dialect',
    route: '/learn/months'
  }
};

const LearnPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initializeAudioContext } = useAudioPreloader();

  // Fetch real module progress data
  const { data: moduleProgress = [], isLoading } = useQuery({
    queryKey: ['moduleProgress'],
    queryFn: () => LearningProgressService.getModuleProgress(),
    enabled: !!user
  });

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle module click - initialize audio context and navigate
  const handleModuleClick = (route: string) => {
    // Initialize audio context on user interaction
    initializeAudioContext();
    // Navigate to the module page
    navigate(route);
  };

  if (!user) {
    return null;
  }

  const renderModuleCards = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="hover:shadow-lg transition-all border-primary/20">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 rounded-b-lg">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    return moduleProgress.map((module) => {
      const config = moduleConfig[module.title as keyof typeof moduleConfig];
      if (!config) return null;

      return (
        <Card key={module.id} className="hover:shadow-lg transition-all border-primary/20 hover:border-primary">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center">
              <span className="mr-2">{config.emoji}</span>
              {module.title}
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{Math.round(module.progress)}%</span>
              </div>
              <Progress value={module.progress} className="h-2 bg-primary/10" />
              <p className="text-xs text-muted-foreground mt-1">
                {module.completedItems} of {module.totalItems} items completed
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="bg-primary/5 rounded-b-lg">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleModuleClick(config.route)}
            >
              {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </CardFooter>
        </Card>
      );
    });
  };

  return (
    <LearnLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Learning Modules</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {renderModuleCards()}
        </div>
      </div>
    </LearnLayout>
  );
};

export default LearnPage;
