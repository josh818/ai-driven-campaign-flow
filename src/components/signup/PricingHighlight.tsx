
import { Star } from 'lucide-react';

const PricingHighlight = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 mb-2">
          <Star className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-semibold">Professional Service</span>
        </div>
        <div className="text-4xl font-bold text-green-700 mb-1">$1,500/month</div>
        <div className="text-green-600 mb-2">Professional campaigns • Expert management</div>
        <div className="text-sm text-green-700">Join professionals who trust BiggerBite experts</div>
      </div>
    </div>
  );
};

export default PricingHighlight;
