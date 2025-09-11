import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
const AboutPage = () => {
  const navigate = useNavigate();
  
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold mb-8">About PhomShah</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="mb-4">Our app places learners at the center of every experience, offering an immersive journey into the Phom Naga dialect, an essential voice of the indigenous Phom Naga community in Nagaland. </p>
          <p className="mb-4">
            Instead of simply building vocabulary lists, we guide you toward true dialect mastery and invite you to connect with your cultural roots. With intuitive, accessible tools and engaging lessons, we strive to safeguard the rich traditions of the Phom Naga dialect and champion the living heritage of its people.
          </p>
          <p>
            Through our bilingual platform, we aim to bridge cultural gaps and ensure that this unique dialect continues to thrive for generations to come. 
          </p>
        </div>
        <div className="bg-white rounded-lg overflow-hidden flex items-center justify-center p-6 border border-gray-200 shadow-md">
          <img alt="PhomShah Logo" className="w-full h-auto object-contain max-h-[400px]" src="/lovable-uploads/027f11f2-a86f-48c0-b0bf-7d290f00944d.png" />
        </div>
      </div>
      
      <div className="border-t border-b py-12 mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Learn Phom Dialect?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
              🏛️
            </div>
            <h3 className="font-bold mb-2">Cultural Heritage</h3>
            <p className="text-sm text-muted-foreground">
              Connect with a rich cultural tradition dating back centuries
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
              🧠
            </div>
            <h3 className="font-bold mb-2">Cognitive Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Enhance your brain function by becoming multilingual
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
              🌍
            </div>
            <h3 className="font-bold mb-2">Preservation</h3>
            <p className="text-sm text-muted-foreground">Help preserve a native dialect that might otherwise be lost</p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 border border-gray-200">
              🤝
            </div>
            <h3 className="font-bold mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">
              Join a community dedicated to language and cultural exchange
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Gamified Learning</h3>
            <p className="text-muted-foreground">
              Our platform uses game-like elements to make learning engaging and effective. Progress through levels, earn achievements, and maintain streaks to stay motivated.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Bilingual Focus</h3>
            <p className="text-muted-foreground">Learn Phom Dialect and English simultaneously with our dual-language approach. Perfect for both native Phom speakers learning English and English speakers learning Phom.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Audio Resources</h3>
            <p className="text-muted-foreground">Hear authentic pronunciations from native speakers. Our audio recordings help you master the unique sounds and intonations of the Phom dialect.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-muted p-8 rounded-lg mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6">Whether you're a native Phom speaker looking to improve your native dialect, or you are interested in learning it, our community welcomes you. Start your language journey today.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/auth">Create Free Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/learn">Explore Lessons</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <span className="text-6xl">👥</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Support Our Project</h2>
        <p className="mb-6">
          PhomShah is a non-profit initiative. We rely on donations and community support to continue developing new content and improving our platform.
        </p>
        <Button asChild>
          <Link to="/donate">Make a Donation</Link>
        </Button>
      </div>
    </div>;
};
export default AboutPage;