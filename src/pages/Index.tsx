import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText, CalendarDays, Calendar, Percent, Gamepad, Leaf, MessageCircle, Users, BookOpen, Info } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const moduleConfig: Record<string, {
  icon: React.ReactNode;
  route: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
  description: string;
}> = {
  'Alphabets': {
    icon: <ScrollText className="h-8 w-8" />,
    route: '/alphabets',
    gradient: 'from-primary/30 to-primary/10',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    hoverBg: 'group-hover:bg-primary/10',
    description: 'Learn Phom alphabets and characters'
  },
  'Numbers': {
    icon: <Percent className="h-8 w-8" />,
    route: '/numbers',
    gradient: 'from-blue-100/30 to-blue-50/10 dark:from-blue-900/30 dark:to-blue-800/10',
    iconBg: 'bg-blue-200/40 dark:bg-blue-800/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hoverBg: 'group-hover:bg-blue-100/20 dark:group-hover:bg-blue-900/20',
    description: 'Learn to count in Phom Dialect'
  },
  'Days': {
    icon: <CalendarDays className="h-8 w-8" />,
    route: '/days',
    gradient: 'from-green-100/30 to-green-50/10 dark:from-green-900/30 dark:to-green-800/10',
    iconBg: 'bg-green-200/40 dark:bg-green-800/40',
    iconColor: 'text-green-600 dark:text-green-400',
    hoverBg: 'group-hover:bg-green-100/20 dark:group-hover:bg-green-900/20',
    description: 'Learn the names of days in Phom Dialect'
  },
  'Months': {
    icon: <Calendar className="h-8 w-8" />,
    route: '/months',
    gradient: 'from-amber-100/30 to-amber-50/10 dark:from-amber-900/30 dark:to-amber-800/10',
    iconBg: 'bg-amber-200/40 dark:bg-amber-800/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBg: 'group-hover:bg-amber-100/20 dark:group-hover:bg-amber-900/20',
    description: 'Learn the names of the months in Phom Dialect'
  },
  'Seasons': {
    icon: <Leaf className="h-8 w-8" />,
    route: '/seasons',
    gradient: 'from-teal-100/30 to-teal-50/10 dark:from-teal-900/30 dark:to-teal-800/10',
    iconBg: 'bg-teal-200/40 dark:bg-teal-800/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
    hoverBg: 'group-hover:bg-teal-100/20 dark:group-hover:bg-teal-900/20',
    description: 'Learn the four seasons in Phom Dialect'
  },
  'Greetings': {
    icon: <MessageCircle className="h-8 w-8" />,
    route: '/greetings',
    gradient: 'from-rose-100/30 to-rose-50/10 dark:from-rose-900/30 dark:to-rose-800/10',
    iconBg: 'bg-rose-200/40 dark:bg-rose-800/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    hoverBg: 'group-hover:bg-rose-100/20 dark:group-hover:bg-rose-900/20',
    description: 'Learn greetings in Phom dialect'
  },
  'Pronouns': {
    icon: <Users className="h-8 w-8" />,
    route: '/pronouns',
    gradient: 'from-purple-100/30 to-purple-50/10 dark:from-purple-900/30 dark:to-purple-800/10',
    iconBg: 'bg-purple-200/40 dark:bg-purple-800/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    hoverBg: 'group-hover:bg-purple-100/20 dark:group-hover:bg-purple-900/20',
    description: 'Learn the Pronouns in Phom dialect'
  },
  'Bible Books': {
    icon: <BookOpen className="h-8 w-8" />,
    route: '/bible-books',
    gradient: 'from-amber-100/30 to-amber-50/10 dark:from-amber-900/30 dark:to-amber-800/10',
    iconBg: 'bg-amber-200/40 dark:bg-amber-800/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBg: 'group-hover:bg-amber-100/20 dark:group-hover:bg-amber-900/20',
    description: 'Learn the name of the Books in the Bible in Phom dialect'
  }
};

const Index = () => {
  const navigate = useNavigate();

  const renderModuleCard = (categoryName: string) => {
    const config = moduleConfig[categoryName];
    if (!config) return null;
    return <Card key={categoryName} className="hover:shadow-lg transition-all overflow-hidden group">
        <CardHeader className={`bg-gradient-to-r ${config.gradient} pb-2 relative`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 transform transition-transform group-hover:scale-110"></div>
          <CardTitle className="text-xl text-center relative z-10">{categoryName}</CardTitle>
          <CardDescription className="relative z-10 text-center">{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center transform transition-transform group-hover:scale-110`}>
              <span className={config.iconColor}>{config.icon}</span>
            </div>
          </AspectRatio>
        </CardContent>
        <CardFooter className="border-t border-muted/20 bg-gradient-to-b from-background to-muted/5">
          <Button variant="ghost" className={`w-full ${config.hoverBg} transition-colors`} onClick={() => navigate(config.route)}>
            Start Learning
          </Button>
        </CardFooter>
      </Card>;
  };

  const moduleOrder = ['Alphabets', 'Numbers', 'Days', 'Months', 'Seasons', 'Greetings', 'Pronouns', 'Bible Books'];
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="text-phom-yellow">Welcome to PhomShah</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium max-w-[800px]">A beginner's guide to learning Phom dialect</h2>
        <p className="text-lg text-muted-foreground max-w-[600px]">Learn Phom vocabularies and dialect basics through interactive lessons and gamified exercises.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button variant="outline" size="lg" onClick={() => navigate('/about')}>
            Learn More
          </Button>
        </div>
      </section>

      {/* Disclaimer Note */}
      <Card className="mb-8 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-start">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Note:</span> The Phom dialect lessons in this app reflect the current state of the dialect, focusing on commonly used words and phrases. Given the limited vocabulary and the evolving nature of the dialect, some concepts or words may not be covered. We aim to provide a foundational understanding, and we're committed to improving the app over time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {moduleOrder.map(moduleName => renderModuleCard(moduleName))}
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
            <h2 className="text-3xl font-bold mb-4">Why Learn Phom Dialect?</h2>
            <p className="text-lg mb-4">It is a rich dialect with a unique cultural heritage. Learning the dialect helps preserve linguistic diversity and connects you to a vibrant community.</p>
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
          <Button variant="outline" size="lg" onClick={() => navigate('/donate')}>
            Support Our Mission
          </Button>
        </div>
        
        {/* Subtle admin link */}
        <div className="mt-12">
          <button onClick={() => navigate('/admin-signin')} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            •
          </button>
        </div>
      </section>
    </div>;
};
export default Index;