
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import AIContentGenerator from '@/components/AIContentGenerator';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your account, subscription, and AI tools</p>
        </div>

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="ai-tools">
            <AIContentGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
