
import { Button } from '@/components/ui/button';
import { Eye, PlusCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const { user } = useAuth();

  const scrollToSuggestedCampaigns = () => {
    const element = document.querySelector('[data-id="suggested-campaigns"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 mb-12">
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
      <div className="relative px-8 py-12 md:py-16">
        <div className="text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <Rocket className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome back, 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              {user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'}! 🚀
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered campaign command center is ready. Monitor your brand, create compelling content, and watch your engagement soar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={scrollToSuggestedCampaigns}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl"
            >
              <Eye className="mr-2 h-5 w-5" />
              View Suggested Campaigns
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 py-4 rounded-xl">
              <Link to="/create-campaign">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Campaign
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
