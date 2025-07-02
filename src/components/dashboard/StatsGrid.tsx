
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Users, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatsGridProps {
  dashboardStats: {
    activeCampaigns: string;
    totalReach: string;
    engagementRate: string;
    brandMentions: string;
    isLoading: boolean;
  };
}

const StatsGrid = ({ dashboardStats }: StatsGridProps) => {
  const stats = [
    { 
      name: 'Active Campaigns', 
      value: dashboardStats.activeCampaigns, 
      icon: Target, 
      change: dashboardStats.isLoading ? '...' : '+2.5%',
      color: 'from-blue-500 to-cyan-500',
      link: '/analytics'
    },
    { 
      name: 'Total Reach', 
      value: dashboardStats.totalReach, 
      icon: Users, 
      change: dashboardStats.isLoading ? '...' : '+12.3%',
      color: 'from-purple-500 to-pink-500',
      link: '/analytics'
    },
    { 
      name: 'Engagement Rate', 
      value: dashboardStats.engagementRate, 
      icon: TrendingUp, 
      change: dashboardStats.isLoading ? '...' : '+0.8%',
      color: 'from-green-500 to-emerald-500',
      link: '/analytics'
    },
    { 
      name: 'Brand Mentions', 
      value: dashboardStats.brandMentions, 
      icon: Shield, 
      change: dashboardStats.isLoading ? '...' : '+5 this week',
      color: 'from-orange-500 to-red-500',
      link: '/reputation'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat) => (
        <Link key={stat.name} to={stat.link}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {dashboardStats.isLoading ? (
                      <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm font-medium text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default StatsGrid;
