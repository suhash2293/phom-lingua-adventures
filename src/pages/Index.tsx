import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, CalendarDays, Calendar, Percent, Gamepad } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
const Index = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="text-phom-yellow">Welcome to PhomShah
        </span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium max-w-[800px]">A learner's centred dialect learning platform</h2>
        <p className="text-lg text-muted-foreground max-w-[600px]">Learn Phom Dialect and English through interactive lessons and gamified exercises.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {!user ? <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button> : null}
          <Button variant="outline" size="lg" onClick={() => navigate('/about')}>
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Alphabets Module */}
          <Card className="hover:shadow-lg transition-all overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-primary/30 to-primary/10 pb-2 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 transform transition-transform group-hover:scale-110"></div>
              <CardTitle className="text-xl relative z-10">Alphabets</CardTitle>
              <CardDescription className="relative z-10">Learn Phom alphabets and characters</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <ScrollText className="h-8 w-8 text-primary" />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="border-t border-muted/20 bg-gradient-to-b from-background to-muted/5">
              <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-colors" onClick={() => navigate('/learn/alphabets')}>
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Numbers Module */}
          <Card className="hover:shadow-lg transition-all overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-blue-100/30 to-blue-50/10 dark:from-blue-900/30 dark:to-blue-800/10 pb-2 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/30 dark:bg-blue-900/30 rounded-full -mr-10 -mt-10 transform transition-transform group-hover:scale-110"></div>
              <CardTitle className="text-xl relative z-10">Numbers</CardTitle>
              <CardDescription className="relative z-10">
                Learn to count in Phom language
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-blue-100/50 to-blue-50/30 dark:from-blue-900/50 dark:to-blue-800/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-200/40 dark:bg-blue-800/40 flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <Percent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="border-t border-muted/20 bg-gradient-to-b from-background to-blue-50/5 dark:to-blue-900/5">
              <Button variant="ghost" className="w-full group-hover:bg-blue-100/20 dark:group-hover:bg-blue-900/20 transition-colors" onClick={() => navigate('/learn/numbers')}>
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Days Module */}
          <Card className="hover:shadow-lg transition-all overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-green-100/30 to-green-50/10 dark:from-green-900/30 dark:to-green-800/10 pb-2 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-100/30 dark:bg-green-900/30 rounded-full -mr-10 -mt-10 transform transition-transform group-hover:scale-110"></div>
              <CardTitle className="text-xl relative z-10">Days</CardTitle>
              <CardDescription className="relative z-10">
                Learn days of the week in Phom
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-green-100/50 to-green-50/30 dark:from-green-900/50 dark:to-green-800/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-200/40 dark:bg-green-800/40 flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <CalendarDays className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="border-t border-muted/20 bg-gradient-to-b from-background to-green-50/5 dark:to-green-900/5">
              <Button variant="ghost" className="w-full group-hover:bg-green-100/20 dark:group-hover:bg-green-900/20 transition-colors" onClick={() => navigate('/learn/days')}>
                Start Learning
              </Button>
            </CardFooter>
          </Card>

          {/* Months Module */}
          <Card className="hover:shadow-lg transition-all overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-amber-100/30 to-amber-50/10 dark:from-amber-900/30 dark:to-amber-800/10 pb-2 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/30 dark:bg-amber-900/30 rounded-full -mr-10 -mt-10 transform transition-transform group-hover:scale-110"></div>
              <CardTitle className="text-xl relative z-10">Months</CardTitle>
              <CardDescription className="relative z-10">
                Learn months and seasons in Phom
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-amber-100/50 to-amber-50/30 dark:from-amber-900/50 dark:to-amber-800/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-200/40 dark:bg-amber-800/40 flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <Calendar className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="border-t border-muted/20 bg-gradient-to-b from-background to-amber-50/5 dark:to-amber-900/5">
              <Button variant="ghost" className="w-full group-hover:bg-amber-100/20 dark:group-hover:bg-amber-900/20 transition-colors" onClick={() => navigate('/learn/months')}>
                Start Learning
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Games Button Section */}
      <section className="py-8 flex justify-center">
        <Button onClick={() => navigate('/games')} className="group bg-phom-yellow hover:bg-amber-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 px-6 py-3 h-auto">
          <Gamepad className="mr-2 h-5 w-5 group-hover:animate-pulse" />
          Play Interactive Games
        </Button>
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
          {!user ? <Button size="lg" onClick={() => navigate('/auth')}>
              Create Free Account
            </Button> : null}
          <Button variant="outline" size="lg" onClick={() => navigate('/donate')}>
            Support Our Mission
          </Button>
        </div>
      </section>
    </div>;
};
export default Index;