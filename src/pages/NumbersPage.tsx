
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Generate numbers 1-100
const generateNumbers = () => {
  // Mock number data for Phom - in reality we would have actual translations
  const numbers = [];
  
  for (let i = 1; i <= 100; i++) {
    numbers.push({
      number: i,
      phom: `Phom-${i}` // Placeholder for actual Phom translations
    });
  }
  
  return numbers;
};

const numbers = generateNumbers();

// Group numbers by tens
const numberGroups = Array.from({ length: 10 }, (_, i) => {
  const start = i * 10 + 1;
  const end = (i + 1) * 10;
  return {
    label: `${start}-${end}`,
    numbers: numbers.slice(i * 10, (i + 1) * 10)
  };
});

const NumbersPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Numbers in Phom (1-100)</h1>
        <p className="text-lg mb-8">Learn to count from 1 to 100 in Phom language.</p>
        
        <Tabs defaultValue="1-10" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            {numberGroups.map((group) => (
              <TabsTrigger 
                key={group.label} 
                value={group.label}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {numberGroups.map((group) => (
            <TabsContent key={group.label} value={group.label} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {group.numbers.map((item) => (
                  <Card key={item.number} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{item.number}</span>
                      <span className="text-lg text-primary-foreground">{item.phom}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </LearnLayout>
  );
};

export default NumbersPage;
