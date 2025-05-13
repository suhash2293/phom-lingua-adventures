
import React from 'react';
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

// Mock learning data
const modules = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Learn essential Phom words and phrases',
    emoji: '🔤',
    progress: 25,
    lessons: [
      { id: 'vocab-1', title: 'Basic Greetings', completed: true },
      { id: 'vocab-2', title: 'Numbers & Counting', completed: true },
      { id: 'vocab-3', title: 'Family Terms', completed: false },
      { id: 'vocab-4', title: 'Food & Drinks', completed: false },
    ]
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    description: 'Master the sounds and accents of Phom',
    emoji: '🔊',
    progress: 10,
    lessons: [
      { id: 'pron-1', title: 'Basic Sounds', completed: true },
      { id: 'pron-2', title: 'Vowels & Consonants', completed: false },
      { id: 'pron-3', title: 'Tones & Accents', completed: false },
      { id: 'pron-4', title: 'Practice Dialogues', completed: false },
    ]
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Learn sentence structure and rules',
    emoji: '📝',
    progress: 0,
    lessons: [
      { id: 'gram-1', title: 'Basic Sentence Structure', completed: false },
      { id: 'gram-2', title: 'Past, Present & Future', completed: false },
      { id: 'gram-3', title: 'Questions & Answers', completed: false },
      { id: 'gram-4', title: 'Complex Sentences', completed: false },
    ]
  },
  {
    id: 'conversation',
    title: 'Conversation',
    description: 'Practice real-life dialogues and scenarios',
    emoji: '💬',
    progress: 0,
    lessons: [
      { id: 'conv-1', title: 'Introducing Yourself', completed: false },
      { id: 'conv-2', title: 'Shopping & Bargaining', completed: false },
      { id: 'conv-3', title: 'Asking for Directions', completed: false },
      { id: 'conv-4', title: 'Daily Conversations', completed: false },
    ]
  }
];

const LearnPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if no user
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
              
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2 bg-primary/10" />
                </div>
                
                <h4 className="font-medium mb-2">Lessons:</h4>
                <ul className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center">
                      <span className={`mr-2 ${lesson.completed ? 'text-green-500' : 'text-primary/50'}`}>
                        {lesson.completed ? '✓' : '○'}
                      </span>
                      <span className={lesson.completed ? 'line-through opacity-70' : ''}>
                        {lesson.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="bg-primary/5 rounded-b-lg">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate(`/learn/${module.id}`)}
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
