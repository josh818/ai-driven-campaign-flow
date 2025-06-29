
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield } from 'lucide-react';

const ActivityInsights = () => {
  return (
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-green-50">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Campaign "Summer Sale" published</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-orange-50">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Brand mention detected</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">AI generated 3 new ideas</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-teal-50">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Response drafted for review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shield className="h-5 w-5 text-teal-600" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <p className="text-gray-700 font-medium">🛡️ Brand sentiment: <span className="text-green-600 font-bold">82% positive</span></p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <p className="text-gray-700 font-medium">⚡ Response time: <span className="text-blue-600 font-bold">2.3 hours avg</span></p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <p className="text-gray-700 font-medium">🎯 Top platforms: <span className="text-purple-600 font-bold">Twitter & Reddit</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityInsights;
