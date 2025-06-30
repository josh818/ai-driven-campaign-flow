
import { useAuth } from '@/hooks/useAuth';

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
      <div className="relative px-6 py-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold mb-2 leading-tight">
            Welcome back, 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              {user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'}! 🚀
            </span>
          </h1>
          <p className="text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered campaign command center is ready. Monitor your brand, create compelling content, and watch your engagement soar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
