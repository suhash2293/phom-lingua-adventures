import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { ArrowLeft, Clock } from 'lucide-react';

import { ContentService } from '@/services/ContentService';
import { GameProgressService } from '@/services/GameProgressService';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

const CARD_PAIRS = 8; // 16 cards total
const SECONDS_PER_GAME = 120; // 2 minutes

type MemoryCard = {
  id: string;
  contentId: string;
  type: 'phom' | 'english';
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryChallengeGame = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SECONDS_PER_GAME);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<MemoryCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [canFlip, setCanFlip] = useState<boolean>(true);
  
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
  
  // Check for game completion
  useEffect(() => {
    if (gameState === 'playing' && matchedPairs === CARD_PAIRS) {
      endGame();
    }
  }, [matchedPairs, gameState]);
  
  // Handle flipped card pair comparison
  useEffect(() => {
    if (flippedCards.length === 2) {
      setCanFlip(false);
      setMoves(moves + 1);
      
      const [first, second] = flippedCards;
      
      if (first.contentId === second.contentId && first.type !== second.type) {
        // Match found
        setMatchedPairs(matchedPairs + 1);
        setScore(score + 10);
        
        setCards(cards.map(card => 
          card.id === first.id || card.id === second.id
            ? { ...card, isMatched: true }
            : card
        ));
        
        setFlippedCards([]);
        setCanFlip(true);
      } else {
        // No match
        setTimeout(() => {
          setCards(cards.map(card => 
            card.id === first.id || card.id === second.id
              ? { ...card, isFlipped: false }
              : card
          ));
          
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  }, [flippedCards]);
  
  // Prepare the memory game cards
  const prepareCards = () => {
    if (contentItems.length < CARD_PAIRS) {
      toast({
        title: "Not enough content",
        description: "There aren't enough words to play this memory game with the selected category.",
        variant: "destructive"
      });
      return false;
    }
    
    // Select random content items for the memory pairs
    const selectedItems = shuffle(contentItems).slice(0, CARD_PAIRS);
    
    // Create pairs of cards - one with Phom word, one with English translation
    const allCards: MemoryCard[] = [];
    
    selectedItems.forEach(item => {
      // Phom word card
      allCards.push({
        id: `phom-${item.id}`,
        contentId: item.id,
        type: 'phom',
        content: item.phom_word,
        isFlipped: false,
        isMatched: false
      });
      
      // English translation card
      allCards.push({
        id: `english-${item.id}`,
        contentId: item.id,
        type: 'english',
        content: item.english_translation,
        isFlipped: false,
        isMatched: false
      });
    });
    
    // Shuffle all cards
    setCards(shuffle(allCards));
    return true;
  };
  
  // Start the game
  const startGame = () => {
    if (!prepareCards()) {
      return;
    }
    
    setGameState('playing');
    setScore(0);
    setTimeRemaining(SECONDS_PER_GAME);
    setMatchedPairs(0);
    setMoves(0);
    setFlippedCards([]);
    setCanFlip(true);
  };
  
  // Handle card flip
  const handleCardFlip = (card: MemoryCard) => {
    if (!canFlip || card.isFlipped || card.isMatched) return;
    
    // Flip the card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    
    setCards(updatedCards);
    
    // Add to flipped cards
    const updatedFlippedCards = [...flippedCards, card];
    setFlippedCards(updatedFlippedCards);
  };
  
  // End the game
  const endGame = async () => {
    setGameState('completed');
    
    const finalScore = score;
    
    // Calculate time taken
    const timeTaken = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : SECONDS_PER_GAME;
    
    // Calculate XP earned based on score and time
    const matchRatio = matchedPairs / CARD_PAIRS;
    const movePenalty = Math.max(0, 1 - ((moves - CARD_PAIRS) / (CARD_PAIRS * 3)));
    const timeBonus = Math.max(0, (SECONDS_PER_GAME - timeTaken) / 10);
    
    const xpEarned = Math.floor((matchRatio * 50 + timeBonus) * (0.5 + 0.5 * movePenalty));
    
    // Record game session if user is logged in
    if (user) {
      await GameProgressService.recordGameSession(
        'memory-challenge',
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
    setTimeRemaining(SECONDS_PER_GAME);
    setGameStartTime(null);
    setMatchedPairs(0);
    setMoves(0);
    setFlippedCards([]);
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
        <h1 className="text-2xl font-bold">Memory Challenge</h1>
      </div>
      
      {gameState === 'intro' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p className="mb-4">
            Match pairs of cards by finding the Phom word and its English translation.
            Remember the positions and make matches with the fewest moves possible.
          </p>
          <Button onClick={startGame}>Start Game</Button>
        </Card>
      )}
      
      {gameState === 'playing' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-bold">{score}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moves</p>
                <p className="text-lg font-bold">{moves}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{timeRemaining}s</p>
            </div>
          </div>
          
          <Progress 
            value={(matchedPairs / CARD_PAIRS) * 100} 
            className="h-2 mb-8" 
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {cards.map(card => (
              <div
                key={card.id}
                className={`
                  aspect-square cursor-pointer perspective-1000
                  ${!canFlip || card.isMatched ? 'pointer-events-none' : ''}
                `}
                onClick={() => handleCardFlip(card)}
              >
                <div
                  className={`
                    relative w-full h-full transition-all duration-500 transform-style-3d
                    ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                  `}
                >
                  {/* Card Back */}
                  <div
                    className={`
                      absolute w-full h-full backface-hidden border rounded-md 
                      flex items-center justify-center p-2 text-center
                      bg-primary/10 hover:bg-primary/15 transition-colors
                      ${(card.isFlipped || card.isMatched) ? 'opacity-0' : 'opacity-100'}
                    `}
                  >
                    <span className="font-bold">?</span>
                  </div>
                  
                  {/* Card Front */}
                  <div
                    className={`
                      absolute w-full h-full backface-hidden border rounded-md
                      rotate-y-180 flex items-center justify-center p-2 text-center
                      ${card.isMatched ? 'bg-green-100 dark:bg-green-900/20' : 'bg-background'}
                      ${card.type === 'phom' ? 'text-primary font-bold' : ''}
                    `}
                  >
                    <span>{card.content}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {gameState === 'completed' && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Game Completed!</h2>
          <div className="mb-4 space-y-2">
            <p className="text-lg">Final Score: {score}</p>
            <p>Matches: {matchedPairs} of {CARD_PAIRS} pairs</p>
            <p>Moves: {moves}</p>
            <p className="text-muted-foreground">
              {matchedPairs === CARD_PAIRS 
                ? `You've completed the memory challenge in ${moves} moves!` 
                : 'You ran out of time. Try again to match all pairs!'}
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
      
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default MemoryChallengeGame;
