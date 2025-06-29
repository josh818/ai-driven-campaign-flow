
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Shield, BarChart3, Clock } from 'lucide-react';

const FeaturesShowcase = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Content Generation',
      description: 'Create compelling campaigns with our advanced AI that understands your brand voice.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Brand Monitoring',
      description: 'Real-time monitoring of brand mentions across all major platforms and social media.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights into campaign performance with actionable recommendations.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Optimize posting times with AI-powered scheduling for maximum engagement.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Supercharge Your Marketing</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Leverage cutting-edge AI and analytics to transform your brand's digital presence
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturesShowcase;
