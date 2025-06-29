
import { Zap } from 'lucide-react';

const PricingHighlight = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 mb-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-semibold">Limited Time Offer</span>
        </div>
        <div className="text-4xl font-bold text-green-700 mb-1">$15/month</div>
        <div className="text-green-600 mb-2">First 30 days free • Cancel anytime</div>
        <div className="text-sm text-green-700">Join 10,000+ marketers already using BiggerBite</div>
      </div>
    </div>
  );
};

export default PricingHighlight;
