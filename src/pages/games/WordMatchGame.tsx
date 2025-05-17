import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { Check, X, ArrowLeft, Clock } from 'lucide-react';

import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

type MatchPair = {
  id: string;
  phomWord: string;
  englishWord: string;
  isMatched: boolean;
};

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_GAME = 120; // 2 minutes

const WordMatchGame = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedPhomWord, setSelectedPhomWord] = useState<string | null>(null);
  const [selectedEnglishWord, setSelectedEnglishWord] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_GAME);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [phomWords, setPhomWords] = useState<string[]>([]);
  const [englishWords, setEnglishWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [pairsForRound, setPairsForRound] = useState<MatchPair[]>([]);
  
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
  
  // Start the game
  const startGame = () => {
    if (contentItems.length < QUESTIONS_PER_GAME) {
      toast({
        title: "Not enough content",
        description: "There aren't enough words to play this game with the selected category.",
        variant: "destructive"
      });
      return;
    }
    
    prepareRound();
    setGameState('playing');
    setScore(0);
    setCurrentQuestion(0);
    setTimeRemaining(SECONDS_PER_GAME);
    setMatchedPairs([]);
  };
  
  // Prepare a round of word matching
  const prepareRound = () => {
    // Select random content items for this round
    const roundItems = shuffle(contentItems).slice(0, QUESTIONS_PER_GAME);
    
    // Create pairs
    const pairs = roundItems.map(item => ({
      id: item.id,
      phomWord: item.phom_word,
      englishWord: item.english_translation,
      isMatched: false
    }));
    
    setPairsForRound(pairs);
    
    // Shuffle words for display
    setPhomWords(shuffle(pairs.map(p => p.phomWord)));
    setEnglishWords(shuffle(pairs.map(p => p.englishWord)));
  };
  
  // Handle word selection
  const handleWordSelect = (word: string, isPhom: boolean) => {
    if (isPhom) {
      setSelectedPhomWord(word);
    } else {
      setSelectedEnglishWord(word);
    }
    
    // Check if both words are selected
    if ((isPhom && selectedEnglishWord) || (!isPhom && selectedPhomWord)) {
      const phom = isPhom ? word : selectedPhomWord;
      const english = isPhom ? selectedEnglishWord : word;
      
      // Find if this is a correct match
      const matchingPair = pairsForRound.find(
        pair => pair.phomWord === phom && pair.englishWord === english
      );
      
      if (matchingPair) {
        // Correct match
        setScore(prevScore => prevScore + 10);
        setMatchedPairs(prev => [...prev, matchingPair.id]);
        
        // Update progress if all pairs are matched
        if (matchedPairs.length + 1 >= QUESTIONS_PER_GAME) {
          endGame();
        }
      } else {
        // Incorrect match
        setScore(prevScore => Math.max(0, prevScore - 2));
      }
      
      // Reset selections
      setSelectedPhomWord(null);
      setSelectedEnglishWord(null);
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
    const xpEarned = Math.floor((scoreRatio * 50) + timeBonus);
    
    // Record game session if user is logged in
    if (user) {
      await GameProgressService.recordGameSession(
        'word-match',
        finalScore,
        timeTaken,
        xpEarned,
        categoryId
      );
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
    setSelectedPhomWord(null);
    setSelectedEnglishWord(null);
    setTimeRemaining(SECONDS_PER_GAME);
    setGameStartTime(null);
    setMatchedPairs([]);
  };
  
  // Function to record game results
  const recordGameResults = async (
    finalScore: number, 
    durationSeconds: number,
    categoryId?: string
  ) => {
    // Calculate XP based on score, time, etc.
    // For example: 10 XP per correct match
    const xpEarned = Math.max(10, finalScore * 10);
    
    try {
      await GameProgressService.recordGameSession(
        'word-match',  // game type identifier
        finalScore,    // user's score in this game
        durationSeconds, // how long the game took
        xpEarned,      // XP to award
        categoryId     // Optional category played
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
        <h1 className="text-2xl font-bold">Word Match</h1>
      </div>
      
      {gameState === 'intro' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p className="mb-4">
            Match the Phom words with their English translations. 
            Select one word from each column to make a pair.
            You'll earn points for correct matches and lose points for incorrect ones.
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </Card>
      )}
      
      {gameState === 'playing' && (
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
            value={(matchedPairs.length / QUESTIONS_PER_GAME) * 100} 
            className="h-2 mb-6" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-lg font-medium mb-4">Phom Words</h3>
              {phomWords.map((word, i) => {
                const isMatched = pairsForRound.some(
                  pair => pair.phomWord === word && matchedPairs.includes(pair.id)
                );
                
                return (
                  <Button
                    key={`phom-${i}`}
                    variant={selectedPhomWord === word ? "default" : "outline"}
                    className={`w-full justify-start ${isMatched ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => !isMatched && handleWordSelect(word, true)}
                    disabled={isMatched}
                  >
                    {word}
                    {isMatched && <Check className="h-4 w-4 ml-auto text-green-500" />}
                  </Button>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium mb-4">English Translations</h3>
              {englishWords.map((word, i) => {
                const isMatched = pairsForRound.some(
                  pair => pair.englishWord === word && matchedPairs.includes(pair.id)
                );
                
                return (
                  <Button
                    key={`english-${i}`}
                    variant={selectedEnglishWord === word ? "default" : "outline"}
                    className={`w-full justify-start ${isMatched ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => !isMatched && handleWordSelect(word, false)}
                    disabled={isMatched}
                  >
                    {word}
                    {isMatched && <Check className="h-4 w-4 ml-auto text-green-500" />}
                  </Button>
                );
              })}
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
              You matched {matchedPairs.length} out of {QUESTIONS_PER_GAME} word pairs.
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

export default WordMatchGame;
