
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock Phom alphabet data
const alphabets = [
  { letter: 'A', pronunciation: 'ah', example: 'Apple - Appul' },
  { letter: 'B', pronunciation: 'buh', example: 'Ball - Baal' },
  { letter: 'C', pronunciation: 'kuh', example: 'Cat - Kaet' },
  // Add more as needed
];

const AlphabetsPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Phom Alphabets</h1>
        <p className="text-lg mb-8">Learn the Phom alphabet with pronunciation and examples.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {alphabets.map((item) => (
            <Card key={item.letter} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="flex items-center justify-center text-4xl">{item.letter}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-center mb-2 font-medium">Pronunciation: <span className="font-normal">{item.pronunciation}</span></p>
                <p className="text-center text-sm text-muted-foreground">{item.example}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LearnLayout>
  );
};

export default AlphabetsPage;
