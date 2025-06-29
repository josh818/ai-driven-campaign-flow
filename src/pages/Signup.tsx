
import ValueProposition from '@/components/signup/ValueProposition';
import SignupForm from '@/components/signup/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-12 items-center">
        {/* Left side - Enhanced Value Proposition */}
        <div className="lg:col-span-3">
          <ValueProposition />
        </div>

        {/* Right side - Enhanced Signup Form */}
        <div className="lg:col-span-2">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default Signup;
