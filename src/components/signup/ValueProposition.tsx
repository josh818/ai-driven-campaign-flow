
import { Sparkles } from 'lucide-react';
import FeaturesList from './FeaturesList';
import TestimonialCard from './TestimonialCard';
import PricingHighlight from './PricingHighlight';

const ValueProposition = () => {
  const testimonial = {
    text: "Our team's 20+ years of experience shows in every campaign. BiggerBite delivered results that exceeded our expectations within weeks!",
    author: "Sarah Chen",
    title: "Marketing Director, TechStart Inc.",
    rating: 5
  };

  return (
    <div className="space-y-8">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">BB</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            BiggerBite
          </h1>
          <p className="text-lg text-gray-600 font-medium">Campaign Manager</p>
        </div>
      </div>
      
      {/* Hero Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-full border border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-blue-800 font-medium text-sm">Professional Campaign Excellence</span>
        </div>
        
        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
          Campaigns Crafted by
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
            20+ Year Veterans
          </span>
        </h2>
        
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
          Your campaigns are created by seasoned professionals with over two decades of marketing expertise. 
          Every strategy, every piece of content, and every optimization is backed by proven experience and results.
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
