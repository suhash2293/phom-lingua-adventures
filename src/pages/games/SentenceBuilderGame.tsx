
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { ArrowLeft, Clock, ArrowRight, Check, X } from 'lucide-react';

import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

const QUESTIONS_PER_GAME = 5; // Fewer questions since this is harder
const SECONDS_PER_GAME = 180; // 3 minutes

type SentencePart = {
  id: string;
  word: string;
  isSelected: boolean;
}

type GameQuestion = {
  contentItem: ContentItem;
  sentence: string;
  parts: SentencePart[];
}

const SentenceBuilderGame = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_GAME);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [selectedParts, setSelectedParts] = useState<SentencePart[]>([]);
  const [availableParts, setAvailableParts] = useState<SentencePart[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Fetch content items based on category
  const { data: fetchedItems, isLoading } = useQuery({
    queryKey: ['contentItems', categoryId],
    queryFn: async () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategory(categoryId);
      } else {
        // Get all categories and select random items from each (excluding alphabets)
        const ALPHABETS_CATEGORY_ID = "17772f98-6ee4-4f94-aa91-d3309dd0f99a";
        const categories = await ContentService.getCategories();
        const filteredCategories = categories.filter(cat => cat.id !== ALPHABETS_CATEGORY_ID);
        let allItems: ContentItem[] = [];
        
        // Guaranteed minimum items per category to ensure all categories are represented
        const MIN_ITEMS_PER_CATEGORY = 4;
        const MAX_ITEMS_TOTAL = 30;
        
        // Get items from each category with guaranteed minimum representation
        for (const category of filteredCategories) {
          const categoryItems = await ContentService.getContentItemsByCategory(category.id);
          // Only include items with example sentences
          const sentenceItems = categoryItems.filter(item => item.example_sentence);
          if (sentenceItems.length > 0) {
            // Shuffle and take at least MIN_ITEMS_PER_CATEGORY from each, or all if less available
            const shuffledItems = shuffle(sentenceItems);
            const itemsToTake = shuffledItems.slice(0, Math.min(MIN_ITEMS_PER_CATEGORY, sentenceItems.length));
            allItems = [...allItems, ...itemsToTake];
          }
        }
        
        // Shuffle combined items and trim to max if needed
        const finalItems = allItems.length > MAX_ITEMS_TOTAL 
          ? shuffle(allItems).slice(0, MAX_ITEMS_TOTAL)
          : shuffle(allItems);
        
        return finalItems;
      }
    }
  });
  
  // Set up the game when content items are loaded
  useEffect(() => {
    if (fetchedItems && fetchedItems.length > 0) {
      // Filter to only include items with example sentences
      const sentenceItems = fetchedItems.filter(item => item.example_sentence);
      setContentItems(sentenceItems);
    }
  }, [fetchedItems]);
  
  // Start game timer when game state changes to playing
  useEffect(() => {
    if (gameState === 'playing') {
      setGameStartTime(Date.now());
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameState]);
  
  // Update available parts when question changes
  useEffect(() => {
    if (gameState === 'playing' && gameQuestions.length > 0) {
      setupCurrentQuestion();
    }
  }, [currentQuestion, gameState, gameQuestions]);
  
  // Prepare questions when game starts
  const prepareQuestions = () => {
    // Filter items with example sentences
    const sentenceItems = contentItems.filter(item => item.example_sentence);
    
    if (sentenceItems.length < QUESTIONS_PER_GAME) {
      toast({
        title: "Not enough sentence content",
        description: "There aren't enough words with example sentences to play this game with the selected category.",
        variant: "destructive"
      });
      return false;
    }
    
    // Select random items with sentences for this game
    const gameItems = shuffle(sentenceItems).slice(0, QUESTIONS_PER_GAME);
    
    // Create questions with scrambled sentence parts
    const questions = gameItems.map(item => {
      const sentence = item.example_sentence || '';
      
      // Split into words and create parts
      const words = sentence.split(/\s+/);
      const parts = words.map((word, index) => ({
        id: `${item.id}-${index}`,
        word: word.replace(/[,.!?;:]/g, ''), // Remove punctuation
        isSelected: false
      }));
      
      return {
        contentItem: item,
        sentence,
        parts: shuffle(parts) // Shuffle the parts
      };
    });
    
    setGameQuestions(questions);
    return true;
  };
  
  // Setup the current question's parts
  const setupCurrentQuestion = () => {
    const currentParts = gameQuestions[currentQuestion].parts;
    setSelectedParts([]);
    setAvailableParts([...currentParts]);
    setHasSubmitted(false);
    setIsCorrect(null);
  };
  
  // Start the game
  const startGame = () => {
    if (!prepareQuestions()) {
      return;
    }
    
    setGameState('playing');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
  };
  
  // Handle selecting a word part
  const handleSelectPart = (part: SentencePart) => {
    if (hasSubmitted) return;
    
    setSelectedParts([...selectedParts, part]);
    setAvailableParts(availableParts.filter(p => p.id !== part.id));
  };
  
  // Handle removing a selected word part
  const handleRemovePart = (part: SentencePart) => {
    if (hasSubmitted) return;
    
    setSelectedParts(selectedParts.filter(p => p.id !== part.id));
    setAvailableParts([...availableParts, part]);
  };
  
  // Check if the sentence is correct
  const handleCheckSentence = () => {
    if (selectedParts.length === 0) return;
    
    const originalSentence = gameQuestions[currentQuestion].sentence
      .toLowerCase()
      .replace(/[,.!?;:]/g, '') // Remove punctuation
      .split(/\s+/); // Split into words
    
    const userSentence = selectedParts.map(part => part.word.toLowerCase());
    
    // Compare words, not caring about punctuation or capitalization
    const correct = originalSentence.length === userSentence.length && 
      originalSentence.every((word, index) => word === userSentence[index]);
    
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (correct) {
      setScore(prev => prev + 20); // More points for sentences
    }
    
    // Wait before moving to next question or ending game
    setTimeout(() => {
      if (currentQuestion + 1 < gameQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        endGame();
      }
    }, 2000);
  };
  
  // Move to the next question without submitting
  const handleSkipQuestion = () => {
    if (currentQuestion + 1 < gameQuestions.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      endGame();
    }
  };
  
  // End the game
  const endGame = async () => {
    setGameState('completed');
    
    const finalScore = score;
    
    // Calculate time taken
    const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : SECONDS_PER_GAME;
    
    // Calculate XP earned based on score and time
    // Sentences are hard, so more XP
    const scoreRatio = finalScore / (QUESTIONS_PER_GAME * 20);
    const timeBonus = Math.max(0, (SECONDS_PER_GAME - timeTaken) / 8);
    const xpEarned = Math.floor((scoreRatio * 100) + timeBonus);
    
    // Record game session
    await GameProgressService.recordGameSession(
      'sentence-builder',
      finalScore,
      timeTaken,
      xpEarned,
      categoryId
    );
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState('intro');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
    setGameStartTime(null);
    setSelectedParts([]);
    setAvailableParts([]);
    setHasSubmitted(false);
    setIsCorrect(null);
  };
  
  if (isLoading) {
    return (
      <div className="container px-4 py-8 text-center">
        <p>Loading game content...</p>
      </div>
    );
  }
  
  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex items-center mb-6 gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/games')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Sentence Builder</h1>
      </div>
      
      {gameState === 'intro' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p className="mb-4">
            Build a correct sentence by selecting the words in the right order.
            Use the example sentence as a guide, but you'll need to arrange the words yourself.
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </Card>
      )}
      
      {gameState === 'playing' && gameQuestions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium">Score: {score}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{timeRemaining}s</p>
            </div>
          </div>
          
          <Progress 
            value={((currentQuestion + 1) / QUESTIONS_PER_GAME) * 100} 
            className="h-2 mb-8" 
          />
          
          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-2">Question {currentQuestion + 1} of {QUESTIONS_PER_GAME}</p>
            
            {/* Clue - show the Phom and English word */}
            <Card className="p-4 mb-8 max-w-2xl mx-auto">
              <p className="font-medium">Clue:</p>
              <div className="flex justify-center gap-4 mt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Phom Word</p>
                  <p className="font-bold">{gameQuestions[currentQuestion].contentItem.phom_word}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">English Translation</p>
                  <p className="font-bold">{gameQuestions[currentQuestion].contentItem.english_translation}</p>
                </div>
              </div>
            </Card>
            
            {/* The sentence being built */}
            <div className="min-h-16 border rounded-lg p-4 flex flex-wrap gap-2 mb-6 max-w-2xl mx-auto">
              {selectedParts.length === 0 ? (
                <p className="text-muted-foreground w-full text-center">Select words to build your sentence</p>
              ) : (
                selectedParts.map((part, i) => (
                  <Button
                    key={part.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemovePart(part)}
                    disabled={hasSubmitted}
                  >
                    {part.word}
                  </Button>
                ))
              )}
              
              {hasSubmitted && (
                <div className="w-full flex justify-center mt-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-5 w-5" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <X className="h-5 w-5" />
                      <span>Not quite right</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Available words */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
              {availableParts.length === 0 && !hasSubmitted ? (
                <p className="text-muted-foreground">All words used</p>
              ) : (
                availableParts.map((part) => (
                  <Button
                    key={part.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectPart(part)}
                    disabled={hasSubmitted}
                  >
                    {part.word}
                  </Button>
                ))
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleCheckSentence} disabled={selectedParts.length === 0 || hasSubmitted}>
                Check Answer
              </Button>
              <Button variant="outline" onClick={handleSkipQuestion} disabled={hasSubmitted}>
                Skip <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
          </div>
        </div>
      )}
      
      {gameState === 'completed' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Game Completed!</h2>
          <div className="mb-4">
            <p className="text-lg">Final Score: {score}</p>
            <p className="text-muted-foreground">
              You correctly built {score / 20} out of {QUESTIONS_PER_GAME} sentences.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={resetGame}>Play Again</Button>
            <Button variant="outline" onClick={() => navigate('/games')}>
              Back to Games
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SentenceBuilderGame;
