
import { Brain, BarChart3, Shield, Clock, Users, Award, Check } from 'lucide-react';

const FeaturesList = () => {
  const features = [
    { icon: Award, text: "20+ years professional expertise", highlight: true },
    { icon: Brain, text: "Veteran-crafted campaign strategies", highlight: true },
    { icon: BarChart3, text: "Advanced analytics & insights", highlight: true },
    { icon: Shield, text: "Real-time brand monitoring", highlight: false },
    { icon: Clock, text: "Professional scheduling optimization", highlight: false },
    { icon: Users, text: "Expert multi-platform management", highlight: false }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
            feature.highlight 
              ? 'bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 shadow-md' 
              : 'bg-white/60 border border-gray-200'
          }`}
        >
          <div className={`p-2 rounded-lg ${
            feature.highlight 
              ? 'bg-gradient-to-br from-blue-500 to-green-500 shadow-lg' 
              : 'bg-gray-100'
          }`}>
            <feature.icon className={`h-5 w-5 ${feature.highlight ? 'text-white' : 'text-gray-600'}`} />
          </div>
          <span className={`font-medium ${feature.highlight ? 'text-blue-900' : 'text-gray-700'}`}>
            {feature.text}
          </span>
          {feature.highlight && <Check className="h-4 w-4 text-green-500 ml-auto" />}
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;
