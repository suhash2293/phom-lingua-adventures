
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LearnLayout from '@/components/layout/LearnLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mock months data
const months = [
  { english: 'January', phom: 'Januari', season: 'Winter' },
  { english: 'February', phom: 'Februwari', season: 'Winter' },
  { english: 'March', phom: 'Marchi', season: 'Spring' },
  { english: 'April', phom: 'Aprili', season: 'Spring' },
  { english: 'May', phom: 'Mäyi', season: 'Spring' },
  { english: 'June', phom: 'Jüni', season: 'Summer' },
  { english: 'July', phom: 'Jüli', season: 'Summer' },
  { english: 'August', phom: 'Augusti', season: 'Summer' },
  { english: 'September', phom: 'Septemberi', season: 'Fall' },
  { english: 'October', phom: 'Octoberi', season: 'Fall' },
  { english: 'November', phom: 'Novemberi', season: 'Fall' },
  { english: 'December', phom: 'Decemberi', season: 'Winter' },
];

const MonthsPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Months in Phom</h1>
        <p className="text-lg mb-8">Learn the months of the year in Phom language.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {months.map((month) => (
            <Card key={month.english} className="border-primary/20 hover:border-primary hover:shadow-md transition-all">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-center">{month.english}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl font-medium text-center mb-2 text-primary-foreground">{month.phom}</p>
                <p className="text-sm text-center text-muted-foreground">Season: {month.season}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LearnLayout>
  );
};

export default MonthsPage;
