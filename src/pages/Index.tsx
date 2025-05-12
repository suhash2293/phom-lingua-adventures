
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="text-phom-yellow">PhomShah</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium max-w-[800px]">
          The Phom Dialect Learning Platform
        </h2>
        <p className="text-lg text-muted-foreground max-w-[600px]">
          Learn Phom language and English through interactive lessons and gamified exercises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {!user ? (
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/learn')}>
              Continue Learning
            </Button>
          )}
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/about')}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vocabulary Module */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">Vocabulary</CardTitle>
              <CardDescription>
                Learn essential words and phrases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-md bg-muted flex items-center justify-center">
                <span className="text-4xl">🔤</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/learn/vocabulary')}
              >
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Pronunciation Module */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">Pronunciation</CardTitle>
              <CardDescription>
                Master the sounds of Phom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-md bg-muted flex items-center justify-center">
                <span className="text-4xl">🔊</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/learn/pronunciation')}
              >
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Grammar Module */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">Grammar</CardTitle>
              <CardDescription>
                Learn sentence structure and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-md bg-muted flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/learn/grammar')}
              >
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Conversation Module */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">Conversation</CardTitle>
              <CardDescription>
                Practice real-life dialogues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded-md bg-muted flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/learn/conversation')}
              >
                Start Learning
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Testimonial/About Section */}
      <section className="py-12 bg-muted rounded-xl p-6 my-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Why Learn Phom?</h2>
            <p className="text-lg mb-4">
              Phom is a rich dialect with a unique cultural heritage. Learning Phom helps preserve linguistic diversity and connects you to a vibrant community.
            </p>
            <p className="text-lg">
              Our platform makes it easy to learn at your own pace, with interactive exercises and audio pronunciations.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-72 h-72 bg-phom-yellow rounded-full flex items-center justify-center">
              <span className="text-6xl">🌍</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to start your journey?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!user ? (
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Free Account
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/learn')}>
              Continue Learning
            </Button>
          )}
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/donate')}
          >
            Support Our Mission
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
