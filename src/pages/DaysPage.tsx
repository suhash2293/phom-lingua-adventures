
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock days of week data
const days = [
  { english: 'Monday', phom: 'Nimani', notes: 'First day of the work week' },
  { english: 'Tuesday', phom: 'Miseni', notes: 'Second day of the work week' },
  { english: 'Wednesday', phom: 'Winasedi', notes: 'Middle of the work week' },
  { english: 'Thursday', phom: 'Thurusi', notes: 'Fourth day of the work week' },
  { english: 'Friday', phom: 'Fridai', notes: 'Last day of the work week' },
  { english: 'Saturday', phom: 'Saturdai', notes: 'First day of the weekend' },
  { english: 'Sunday', phom: 'Sundai', notes: 'Second day of the weekend' },
];

const DaysPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Days of the Week in Phom</h1>
        <p className="text-lg mb-8">Learn the days of the week in Phom language.</p>
        
        <div className="space-y-4">
          {days.map((day) => (
            <Card key={day.english} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
              <div className="md:flex">
                <CardHeader className="bg-primary/5 md:w-1/3 flex flex-col justify-center">
                  <CardTitle className="text-center">{day.english}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:w-2/3 flex flex-col justify-center">
                  <p className="text-xl font-medium mb-2 text-primary-foreground">{day.phom}</p>
                  <p className="text-sm text-muted-foreground">{day.notes}</p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </LearnLayout>
  );
};

export default DaysPage;
