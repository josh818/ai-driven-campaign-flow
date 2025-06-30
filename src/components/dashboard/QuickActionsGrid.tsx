
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, BarChart3, Shield, Zap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActionsGrid = () => {
  const scrollToSuggestedCampaigns = () => {
    const element = document.querySelector('[data-id="suggested-campaigns"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickActions = [
    { 
      name: 'View Suggested Campaigns', 
      icon: Eye, 
      color: 'from-purple-500 to-pink-500', 
      href: '#',
      onClick: scrollToSuggestedCampaigns,
      description: 'Browse AI-generated campaign ideas'
    },
    { 
      name: 'Create Campaign', 
      icon: PlusCircle, 
      color: 'from-blue-500 to-cyan-500', 
      href: '/create-campaign',
      description: 'Launch new AI-powered campaigns'
    },
    { 
      name: 'Reputation Manager', 
      icon: Shield, 
      color: 'from-teal-500 to-green-500', 
      href: '/reputation',
      description: 'Monitor brand mentions'
    },
    { 
      name: 'View Analytics', 
      icon: BarChart3, 
      color: 'from-green-500 to-teal-500', 
      href: '/analytics',
      description: 'Track performance metrics'
    },
    { 
      name: 'View Calendar', 
      icon: Calendar, 
      color: 'from-cyan-500 to-blue-500', 
      href: '/calendar',
      description: 'Schedule content releases'
    },
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Jump into your most powerful tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            action.onClick ? (
              <div key={action.name} onClick={action.onClick}>
                <Card className="border-2 hover:border-teal-300 transition-all duration-200 hover:shadow-lg group hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Link key={action.name} to={action.href}>
                <Card className="border-2 hover:border-teal-300 transition-all duration-200 hover:shadow-lg group hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsGrid;
