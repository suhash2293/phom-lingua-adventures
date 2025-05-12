import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/components/ui/use-toast';

// Mock module data
const modulesData = {
  vocabulary: {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Learn essential Phom words and phrases',
    lessons: [
      {
        id: 'vocab-1',
        title: 'Basic Greetings',
        content: [
          {
            type: 'text',
            value: 'In this lesson, you will learn basic greetings in Phom language.'
          },
          {
            type: 'vocabulary',
            items: [
              { phom: 'Kaipang', english: 'Hello', audio: 'kaipang.mp3' },
              { phom: 'Annoi', english: 'Goodbye', audio: 'annoi.mp3' },
              { phom: 'Kamüyangtang', english: 'Thank you (with special character Ü)', audio: 'kamuyangtang.mp3' },
              { phom: 'Maichami', english: 'How are you?', audio: 'maichami.mp3' },
            ]
          },
          {
            type: 'exercise',
            question: 'What is "Hello" in Phom?',
            options: ['Annoi', 'Kaipang', 'Maichami', 'Kamüyangtang'],
            answer: 'Kaipang'
          }
        ]
      },
      {
        id: 'vocab-2',
        title: 'Numbers & Counting',
        content: [
          {
            type: 'text',
            value: 'Learn to count in Phom language from 1 to 10.'
          },
          {
            type: 'vocabulary',
            items: [
              { phom: 'Achü', english: 'One', audio: 'achu.mp3' },
              { phom: 'Anu', english: 'Two', audio: 'anu.mp3' },
              { phom: 'Asam', english: 'Three', audio: 'asam.mp3' },
              { phom: 'Phili', english: 'Four', audio: 'phili.mp3' },
              { phom: 'Phungu', english: 'Five', audio: 'phungu.mp3' },
            ]
          },
          {
            type: 'exercise',
            question: 'What is "Three" in Phom?',
            options: ['Achü', 'Anu', 'Asam', 'Phili'],
            answer: 'Asam'
          }
        ]
      },
      // Other lessons here
    ]
  },
  pronunciation: {
    id: 'pronunciation',
    title: 'Pronunciation',
    description: 'Master the sounds and accents of Phom',
    lessons: [
      {
        id: 'pron-1',
        title: 'Basic Sounds',
        content: [
          {
            type: 'text',
            value: 'Learn the basic sounds in Phom language.'
          },
          {
            type: 'audio',
            label: 'Listen to the basic vowel sounds:',
            src: 'basic-vowels.mp3'
          },
          {
            type: 'exercise',
            question: 'Which sound is represented by "Ü"?',
            options: ['Long U as in "rule"', 'Short U as in "put"', 'German Ü sound', 'French U sound'],
            answer: 'German Ü sound'
          }
        ]
      }
    ]
  },
  grammar: {
    id: 'grammar',
    title: 'Grammar',
    description: 'Learn sentence structure and rules',
    lessons: [
      {
        id: 'gram-1',
        title: 'Basic Sentence Structure',
        content: [
          {
            type: 'text',
            value: 'Phom sentences typically follow the Subject-Object-Verb (SOV) structure.'
          },
          {
            type: 'example',
            phom: 'Ni anu anchengok',
            english: 'I rice eat',
            translation: 'I eat rice.'
          },
          {
            type: 'exercise',
            question: 'What word order does Phom language follow?',
            options: ['Subject-Verb-Object (SVO)', 'Subject-Object-Verb (SOV)', 'Verb-Subject-Object (VSO)', 'Object-Subject-Verb (OSV)'],
            answer: 'Subject-Object-Verb (SOV)'
          }
        ]
      }
    ]
  },
  conversation: {
    id: 'conversation',
    title: 'Conversation',
    description: 'Practice real-life dialogues and scenarios',
    lessons: [
      {
        id: 'conv-1',
        title: 'Introducing Yourself',
        content: [
          {
            type: 'text',
            value: 'Learn how to introduce yourself in Phom.'
          },
          {
            type: 'dialogue',
            exchanges: [
              {
                phom: 'Kaipang, ni ming John.',
                english: 'Hello, my name is John.',
                audio: 'intro-1.mp3'
              },
              {
                phom: 'Na ming ngachümi?',
                english: 'What is your name?',
                audio: 'intro-2.mp3'
              }
            ]
          },
          {
            type: 'exercise',
            question: 'How do you ask "What is your name?" in Phom?',
            options: [
              'Kaipang, ni ming',
              'Na ming ngachümi?',
              'Ni ming John',
              'Annoi'
            ],
            answer: 'Na ming ngachümi?'
          }
        ]
      }
    ]
  }
};

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [lessonCompleted, setLessonCompleted] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!moduleId || !modulesData[moduleId as keyof typeof modulesData]) {
      navigate('/learn');
      return;
    }
    
    setCurrentModule(modulesData[moduleId as keyof typeof modulesData]);
    setSelectedLesson(null);
    setCurrentStep(0);
    setUserAnswers({});
    
  }, [moduleId, user, navigate]);

  if (!user || !currentModule) {
    return null;
  }
  
  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setUserAnswers({});
    setLessonCompleted(false);
  };
  
  const handleAnswerSelect = (question: string, option: string) => {
    setUserAnswers({
      ...userAnswers,
      [question]: option
    });
  };
  
  const handleNextStep = () => {
    if (currentStep < selectedLesson.content.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Check answers
      let correct = 0;
      let total = 0;
      
      selectedLesson.content.forEach((item: any) => {
        if (item.type === 'exercise') {
          total++;
          if (userAnswers[item.question] === item.answer) {
            correct++;
          }
        }
      });
      
      const percentCorrect = total > 0 ? Math.round((correct / total) * 100) : 100;
      
      if (percentCorrect >= 70) {
        setLessonCompleted(true);
        toast({
          title: "Lesson Completed!",
          description: `You got ${correct} out of ${total} questions correct (${percentCorrect}%)`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Try Again",
          description: `You got ${correct} out of ${total} questions correct (${percentCorrect}%). You need 70% to pass.`,
        });
      }
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleFinishLesson = () => {
    setSelectedLesson(null);
    toast({
      title: "Progress Saved",
      description: "Your progress has been saved.",
    });
  };
  
  // Calculate progress for this module
  const completedLessons = currentModule.lessons.filter((lesson: any) => 
    // This would normally check a user's progress in a database
    lesson.id === 'vocab-1' || lesson.id === 'pron-1'
  ).length;
  
  const progressPercentage = Math.round((completedLessons / currentModule.lessons.length) * 100);
  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      {!selectedLesson ? (
        <>
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
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid gap-4">
            {currentModule.lessons.map((lesson: any) => (
              <Card key={lesson.id}>
                <div className="flex items-center p-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                  </div>
                  <Button onClick={() => handleSelectLesson(lesson)}>
                    Start Lesson
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedLesson(null)}
              className="mr-4"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
          </div>
          
          {lessonCompleted ? (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">Lesson Completed!</CardTitle>
                <CardDescription className="text-green-600">
                  You've successfully completed this lesson
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Great work! You can now move on to the next lesson or practice more.</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleFinishLesson}>Finish</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6">
                {selectedLesson.content[currentStep].type === 'text' && (
                  <p className="mb-4">{selectedLesson.content[currentStep].value}</p>
                )}
                
                {selectedLesson.content[currentStep].type === 'vocabulary' && (
                  <div className="space-y-4">
                    <h3 className="font-medium mb-2">Vocabulary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLesson.content[currentStep].items.map((item: any, index: number) => (
                        <Card key={index} className="p-4 flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xl font-bold phom-font">{item.phom}</span>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              🔊
                            </Button>
                          </div>
                          <span className="text-muted-foreground">{item.english}</span>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedLesson.content[currentStep].type === 'audio' && (
                  <div className="space-y-4">
                    <h3 className="font-medium mb-2">{selectedLesson.content[currentStep].label}</h3>
                    <div className="bg-muted p-4 rounded-md flex items-center justify-center">
                      <Button>Play Audio 🔊</Button>
                    </div>
                  </div>
                )}
                
                {selectedLesson.content[currentStep].type === 'example' && (
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <p className="font-bold phom-font mb-2">{selectedLesson.content[currentStep].phom}</p>
                    <p className="italic mb-2">{selectedLesson.content[currentStep].english}</p>
                    <p>{selectedLesson.content[currentStep].translation}</p>
                  </div>
                )}
                
                {selectedLesson.content[currentStep].type === 'dialogue' && (
                  <div className="space-y-4">
                    <h3 className="font-medium mb-2">Dialogue</h3>
                    {selectedLesson.content[currentStep].exchanges.map((exchange: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold phom-font">{exchange.phom}</span>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            🔊
                          </Button>
                        </div>
                        <span className="text-muted-foreground">{exchange.english}</span>
                      </Card>
                    ))}
                  </div>
                )}
                
                {selectedLesson.content[currentStep].type === 'exercise' && (
                  <div className="space-y-6">
                    <h3 className="font-medium mb-4">Practice Exercise</h3>
                    <p className="mb-6">{selectedLesson.content[currentStep].question}</p>
                    
                    <div className="space-y-3">
                      {selectedLesson.content[currentStep].options.map((option: string) => (
                        <div 
                          key={option}
                          className={`p-3 border rounded-md cursor-pointer ${
                            userAnswers[selectedLesson.content[currentStep].question] === option 
                            ? 'border-phom-yellow bg-phom-yellow/10' 
                            : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleAnswerSelect(selectedLesson.content[currentStep].question, option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {currentStep + 1} / {selectedLesson.content.length}
                  </span>
                </div>
                
                <Button onClick={handleNextStep}>
                  {currentStep < selectedLesson.content.length - 1 ? 'Next' : 'Complete'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleDetailPage;
