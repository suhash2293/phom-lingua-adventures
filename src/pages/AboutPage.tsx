
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-8">About PhomShah</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="mb-4">
            PhomShah is dedicated to preserving and promoting the Phom language, a dialect spoken primarily in Nagaland, India. Our mission is to create accessible, engaging learning resources for both native speakers and language enthusiasts.
          </p>
          <p>
            Through our bilingual platform, we aim to bridge cultural gaps and ensure that this unique language continues to thrive for generations to come.
          </p>
        </div>
        <div className="bg-phom-yellow rounded-lg overflow-hidden">
          <img
            src="/lovable-uploads/0d42e53f-67e0-44b9-b835-4ca4918bd0dd.png"
            alt="Traditional Phom Cultural Element"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="border-t border-b py-12 mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Learn Phom?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-phom-yellow rounded-full flex items-center justify-center mb-4">
              🏛️
            </div>
            <h3 className="font-bold mb-2">Cultural Heritage</h3>
            <p className="text-sm text-muted-foreground">
              Connect with a rich cultural tradition dating back centuries
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-phom-yellow rounded-full flex items-center justify-center mb-4">
              🧠
            </div>
            <h3 className="font-bold mb-2">Cognitive Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Enhance your brain function by becoming multilingual
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-phom-yellow rounded-full flex items-center justify-center mb-4">
              🌍
            </div>
            <h3 className="font-bold mb-2">Preservation</h3>
            <p className="text-sm text-muted-foreground">
              Help preserve a language that might otherwise be lost
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="w-12 h-12 bg-phom-yellow rounded-full flex items-center justify-center mb-4">
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
            <p className="text-muted-foreground">
              Learn Phom and English simultaneously with our dual-language approach. Perfect for both native Phom speakers learning English and English speakers learning Phom.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Audio Resources</h3>
            <p className="text-muted-foreground">
              Hear authentic pronunciations from native speakers. Our audio recordings help you master the unique sounds and intonations of the Phom language.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-muted p-8 rounded-lg mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6">
              Whether you're a native Phom speaker looking to improve your English, or you're interested in learning this unique dialect, our community welcomes you. Start your language journey today.
            </p>
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
            <div className="w-40 h-40 bg-phom-yellow rounded-full flex items-center justify-center">
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
    </div>
  );
};

export default AboutPage;
