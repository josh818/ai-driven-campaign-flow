
import { Sparkles } from 'lucide-react';
import FeaturesList from './FeaturesList';
import TestimonialCard from './TestimonialCard';
import PricingHighlight from './PricingHighlight';

const ValueProposition = () => {
  const testimonial = {
    text: "BiggerBite transformed our marketing strategy. We saw 300% increase in engagement within the first month!",
    author: "Sarah Chen",
    title: "Marketing Director, TechStart Inc.",
    rating: 5
  };

  return (
    <div className="space-y-8">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">BB</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            BiggerBite
          </h1>
          <p className="text-lg text-gray-600 font-medium">Campaign Manager</p>
        </div>
      </div>
      
      {/* Hero Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-purple-800 font-medium text-sm">AI-Powered Marketing Revolution</span>
        </div>
        
        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
          Transform Your 
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Marketing Game
          </span>
        </h2>
        
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
          Join thousands of marketers who've supercharged their campaigns with AI-powered content generation, 
          real-time brand monitoring, and advanced analytics that actually drive results.
        </p>
      </div>

      {/* Enhanced Features Grid */}
      <FeaturesList />

      {/* Social Proof */}
      <TestimonialCard testimonial={testimonial} />

      {/* Pricing Highlight */}
      <PricingHighlight />
    </div>
  );
};

export default ValueProposition;
