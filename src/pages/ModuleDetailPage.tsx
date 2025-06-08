
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/components/ui/use-toast';
import { ContentService } from '@/services/ContentService';
import { LearningProgressService } from '@/services/LearningProgressService';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [lessonCompleted, setLessonCompleted] = useState(false);
  
  // Fetch category data based on moduleId
  const { data: categoryData } = useQuery({
    queryKey: ['category', moduleId],
    queryFn: async () => {
      const categories = await ContentService.getCategories();
      const categoryMap: { [key: string]: string } = {
        'alphabets': 'Alphabet',
        'numbers': 'Numbers',
        'days': 'Days',
        'months': 'Months'
      };
      const categoryName = categoryMap[moduleId as string];
      return categories.find(cat => cat.name === categoryName);
    },
    enabled: !!moduleId
  });

  // Fetch content items for this category
  const { data: contentItems = [] } = useQuery({
    queryKey: ['content-items', categoryData?.id],
    queryFn: () => ContentService.getContentItemsByCategoryId(categoryData!.id),
    enabled: !!categoryData
  });

  // Fetch user's progress for this category
  const { data: categoryProgress = 0 } = useQuery({
    queryKey: ['category-progress', categoryData?.id],
    queryFn: () => LearningProgressService.getCategoryProgress(categoryData!.id),
    enabled: !!categoryData && !!user
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!moduleId || !['alphabets', 'numbers', 'days', 'months'].includes(moduleId)) {
      navigate('/learn');
      return;
    }
    
    setSelectedLesson(null);
    setCurrentStep(0);
    setUserAnswers({});
    
  }, [moduleId, user, navigate]);

  if (!user || !categoryData) {
    return null;
  }

  const moduleConfig = {
    'alphabets': { title: 'Alphabets', description: 'Learn the Phom alphabet and characters' },
    'numbers': { title: 'Numbers', description: 'Master counting from 1 to 100 in Phom' },
    'days': { title: 'Days', description: 'Learn days of the week in Phom' },
    'months': { title: 'Months', description: 'Learn months and seasons in Phom' }
  };

  const currentModule = moduleConfig[moduleId as keyof typeof moduleConfig];

  // Create lessons based on content items
  const lessons = [
    {
      id: 'content-review',
      title: `${currentModule.title} Review`,
      description: `Review all ${currentModule.title.toLowerCase()} with audio pronunciation`,
      content: contentItems.map(item => ({
        type: 'vocabulary',
        phom: item.phom_word,
        english: item.english_translation,
        example: item.example_sentence,
        audio: item.audio_url
      }))
    }
  ];

  const handleSelectLesson = async (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setUserAnswers({});
    setLessonCompleted(false);
    
    // Track lesson started
    if (categoryData) {
      await LearningProgressService.trackProgress(categoryData.id, null, 'lesson_completed');
    }
  };
  
  const handleFinishLesson = () => {
    setSelectedLesson(null);
    toast({
      title: "Progress Saved",
      description: "Your progress has been saved.",
    });
  };

  // Navigate to the specific content page instead of mock lessons
  const handleStartLearning = () => {
    const routes = {
      'alphabets': '/learn/alphabets',
      'numbers': '/learn/numbers',
      'days': '/learn/days',
      'months': '/learn/months'
    };
    navigate(routes[moduleId as keyof typeof routes]);
  };
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/learn')}
          className="mr-4"
        >
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">{currentModule.title}</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Module Progress</span>
          <span className="text-sm font-medium">{Math.round(categoryProgress)}%</span>
        </div>
        <Progress value={categoryProgress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          Based on your interaction with {contentItems.length} {currentModule.title.toLowerCase()} items
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Interactive Learning</CardTitle>
            <CardDescription>
              Explore {currentModule.title.toLowerCase()} with audio pronunciation and examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Click below to start learning {currentModule.title.toLowerCase()} interactively. 
              You can listen to pronunciations, see examples, and track your progress.
            </p>
            <p className="text-sm text-muted-foreground">
              Progress is automatically tracked as you interact with the content.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartLearning} className="w-full">
              Start Interactive Learning
            </Button>
          </CardFooter>
        </Card>

        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardHeader>
              <CardTitle>{lesson.title}</CardTitle>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {lesson.content.length} items to review
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSelectLesson(lesson)}
                variant="outline"
                className="w-full"
              >
                Quick Review
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedLesson.title}</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedLesson(null)}
                className="absolute right-4 top-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedLesson.content.map((item: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl font-bold">{item.phom}</span>
                      {item.audio && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          🔊
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-1">{item.english}</p>
                    {item.example && (
                      <p className="text-sm text-muted-foreground italic">{item.example}</p>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleFinishLesson} className="w-full">
                Complete Review
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModuleDetailPage;
