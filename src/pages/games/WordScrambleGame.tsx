import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { ArrowLeft, Clock, ArrowRight, Check, X } from 'lucide-react';

import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { AchievementService } from '@/services/AchievementService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_GAME = 120; // 2 minutes

type LetterTile = {
  id: string;
  letter: string;
  isSelected: boolean;
}

type GameQuestion = {
  contentItem: ContentItem;
  originalWord: string;
  scrambledLetters: LetterTile[];
}

const WordScrambleGame = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_GAME);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<LetterTile[]>([]);
  const [availableLetters, setAvailableLetters] = useState<LetterTile[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Fetch content items based on category
  const { data: fetchedItems, isLoading } = useQuery({
    queryKey: ['contentItems', categoryId],
    queryFn: async () => {
      if (categoryId) {
        return ContentService.getContentItemsByCategory(categoryId);
      } else {
        // Get all categories and select random items from each
        const categories = await ContentService.getCategories();
        let allItems: ContentItem[] = [];
        
        // Get some items from each category
        for (const category of categories) {
          const categoryItems = await ContentService.getContentItemsByCategory(category.id);
          allItems = [...allItems, ...categoryItems];
        }
        
        return shuffle(allItems).slice(0, 30); // Limit to 30 random items
      }
    }
  });
  
  // Set up the game when content items are loaded
  useEffect(() => {
    if (fetchedItems && fetchedItems.length > 0) {
      setContentItems(fetchedItems);
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
  
  // Update available letters when question changes
  useEffect(() => {
    if (gameState === 'playing' && gameQuestions.length > 0) {
      setupCurrentQuestion();
    }
  }, [currentQuestion, gameState, gameQuestions]);
  
  // Scrambles a word into individual letter tiles
  const scrambleWord = (word: string): LetterTile[] => {
    const letters = word.split('');
    
    // Create letter tiles
    const tiles = letters.map((letter, index) => ({
      id: `letter-${index}-${Date.now()}`, // Create unique IDs
      letter,
      isSelected: false
    }));
    
    // Ensure the word is actually scrambled and not the same as original
    let scrambled = [...tiles];
    let attempts = 0;
    const maxAttempts = 10;

    do {
      scrambled = shuffle([...tiles]);
      attempts++;
      
      // Check if scrambled is different from original
      const isScrambled = scrambled.some((tile, index) => 
        tile.letter !== letters[index]
      );
      
      if (isScrambled) break;
    } while (attempts < maxAttempts);
    
    return scrambled;
  };
  
  // Prepare questions when game starts
  const prepareQuestions = () => {
    // Filter out items with very short words (less than 3 letters)
    const validItems = contentItems.filter(item => item.phom_word.length >= 3);
    
    if (validItems.length < QUESTIONS_PER_GAME) {
      toast({
        title: "Not enough content",
        description: "There aren't enough words in this category to play the game.",
        variant: "destructive"
      });
      return false;
    }
    
    // Select random items for this game
    const gameItems = shuffle(validItems).slice(0, QUESTIONS_PER_GAME);
    
    // Create questions with scrambled letters
    const questions = gameItems.map(item => {
      const word = item.phom_word.trim().toLowerCase();
      
      return {
        contentItem: item,
        originalWord: word,
        scrambledLetters: scrambleWord(word)
      };
    });
    
    setGameQuestions(questions);
    return true;
  };
  
  // Setup the current question's letters
  const setupCurrentQuestion = () => {
    const currentScrambledLetters = gameQuestions[currentQuestion].scrambledLetters;
    setSelectedLetters([]);
    setAvailableLetters([...currentScrambledLetters]);
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
  
  // Handle selecting a letter tile
  const handleSelectLetter = (letter: LetterTile) => {
    if (hasSubmitted) return;
    
    setSelectedLetters([...selectedLetters, letter]);
    setAvailableLetters(availableLetters.filter(l => l.id !== letter.id));
  };
  
  // Handle removing a selected letter tile
  const handleRemoveLetter = (letter: LetterTile) => {
    if (hasSubmitted) return;
    
    setSelectedLetters(selectedLetters.filter(l => l.id !== letter.id));
    setAvailableLetters([...availableLetters, letter]);
  };
  
  // Check if the word is correct
  const handleCheckWord = () => {
    if (selectedLetters.length === 0) return;
    
    const originalWord = gameQuestions[currentQuestion].originalWord.toLowerCase();
    const userWord = selectedLetters.map(letter => letter.letter).join('').toLowerCase();
    
    const correct = userWord === originalWord;
    
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (correct) {
      setScore(prev => prev + 10);
    }
    
    // Wait before moving to next question or ending game
    setTimeout(() => {
      if (currentQuestion + 1 < gameQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        endGame();
      }
    }, 1500);
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
    const scoreRatio = finalScore / (QUESTIONS_PER_GAME * 10);
    const timeBonus = Math.max(0, (SECONDS_PER_GAME - timeTaken) / 10);
    const xpEarned = Math.floor((scoreRatio * 75) + timeBonus);
    
    // Record game session if user is logged in
    if (user) {
      await GameProgressService.recordGameSession(
        'word-scramble',
        finalScore,
        timeTaken,
        xpEarned,
        categoryId
      );
      
      // Check for achievements
      AchievementService.checkAndAwardAchievements();
    } else {
      toast({
        title: "Game completed!",
        description: "Sign in to save your progress and earn XP.",
      });
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState('intro');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
    setGameStartTime(null);
    setSelectedLetters([]);
    setAvailableLetters([]);
    setHasSubmitted(false);
    setIsCorrect(null);
  };
  
  // Function to record game results
  const recordGameResults = async (
    finalScore: number, 
    durationSeconds: number,
    categoryId?: string
  ) => {
    // Calculate XP based on difficulty, score, time, etc.
    const xpEarned = Math.max(10, finalScore * 15); // Scramble can award a bit more XP since it's more challenging
    
    try {
      await GameProgressService.recordGameSession(
        'word-scramble',  // game type identifier
        finalScore,       // user's score in this game
        durationSeconds,  // how long the game took
        xpEarned,         // XP to award
        categoryId        // Optional category played
      );
    } catch (error) {
      console.error("Failed to record game progress:", error);
      // Game can continue even if progress saving fails
    }
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
        <h1 className="text-2xl font-bold">Word Scramble</h1>
      </div>
      
      {gameState === 'intro' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p className="mb-4">
            Unscramble the letters to form the correct Phom word. 
            The English translation is provided as a hint. 
            Select letters in the correct order to build the word.
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
            
            {/* Clue - show the English translation */}
            <Card className="p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground mb-1">Hint: English Translation</p>
              <p className="font-bold text-lg">{gameQuestions[currentQuestion].contentItem.english_translation}</p>
            </Card>
            
            {/* The word being built */}
            <div className="min-h-16 border rounded-lg p-4 flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
              {selectedLetters.length === 0 ? (
                <p className="text-muted-foreground w-full text-center">Select letters to build the word</p>
              ) : (
                selectedLetters.map((tile) => (
                  <Button
                    key={tile.id}
                    variant="secondary"
                    size="sm"
                    className="w-12 h-12 text-lg font-bold"
                    onClick={() => handleRemoveLetter(tile)}
                    disabled={hasSubmitted}
                  >
                    {tile.letter}
                  </Button>
                ))
              )}
              
              {hasSubmitted && (
                <div className="w-full flex justify-center mt-4">
                  {isCorrect ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="h-5 w-5" />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <div className="flex items-center">
                        <X className="h-5 w-5" />
                        <span>Not correct</span>
                      </div>
                      <p className="text-sm">
                        Correct answer: <span className="font-bold">{gameQuestions[currentQuestion].originalWord}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Available letter tiles */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-2xl mx-auto">
              {availableLetters.length === 0 && !hasSubmitted ? (
                <p className="text-muted-foreground">All letters used</p>
              ) : (
                availableLetters.map((tile) => (
                  <Button
                    key={tile.id}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 text-lg font-bold animate-scale-in hover:bg-primary/20"
                    onClick={() => handleSelectLetter(tile)}
                    disabled={hasSubmitted}
                  >
                    {tile.letter}
                  </Button>
                ))
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={handleCheckWord} disabled={selectedLetters.length === 0 || hasSubmitted}>
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
              You correctly unscrambled {score / 10} out of {QUESTIONS_PER_GAME} words.
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

export default WordScrambleGame;
