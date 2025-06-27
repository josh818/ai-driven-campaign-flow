
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload, User, Building, Target, Image, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tableExists, setTableExists] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    company_name: '',
    company_description: '',
    target_audience: '',
    logo_file: null as File | null,
    office_file: null as File | null
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Check if onboarding_data table exists by trying to query it
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error) {
        setTableExists(true);
        if (data?.onboarding_completed) {
          navigate('/');
        }
      } else {
        setTableExists(false);
        console.log('Onboarding data table not available yet');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setTableExists(false);
    }
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileChange = (field: 'logo_file' | 'office_file', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Upload files if provided
      let logoUrl = '';
      let officeImageUrl = '';

      if (formData.logo_file) {
        try {
          logoUrl = await uploadFile(formData.logo_file, 'logos');
        } catch (error) {
          console.error('Error uploading logo:', error);
        }
      }

      if (formData.office_file) {
        try {
          officeImageUrl = await uploadFile(formData.office_file, 'office');
        } catch (error) {
          console.error('Error uploading office image:', error);
        }
      }

      // Update profile with basic information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Try to create onboarding data if table exists
      if (tableExists) {
        const { error: onboardingError } = await supabase
          .from('onboarding_data')
          .upsert({
            user_id: user.id,
            company_description: formData.company_description,
            target_audience: formData.target_audience,
            logo_url: logoUrl,
            office_image_url: officeImageUrl,
            onboarding_completed: true
          });

        if (onboardingError) {
          console.error('Onboarding data error:', onboardingError);
        }
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile information has been saved successfully."
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Campaign Manager
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Let's set up your profile to get started
            </p>
          </div>
          
          {!tableExists && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">
                  Advanced onboarding features are being set up. Basic profile setup is available.
                </p>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">Step {currentStep} of 3</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <User className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-600">Tell us about yourself</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Building className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                  <p className="text-sm text-gray-600">Help us understand your business</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description">Company Description</Label>
                  <Textarea
                    id="company_description"
                    value={formData.company_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_description: e.target.value }))}
                    placeholder="Describe what your company does, your mission, and key services..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Textarea
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                    placeholder="Describe your ideal customers, demographics, interests..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Branding Assets */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Image className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Brand Assets</h3>
                  <p className="text-sm text-gray-600">Upload your brand images (optional)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logo_file', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="logo" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {formData.logo_file ? formData.logo_file.name : 'Click to upload your logo'}
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office">Office Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="office"
                      accept="image/*"
                      onChange={(e) => handleFileChange('office_file', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="office" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {formData.office_file ? formData.office_file.name : 'Click to upload office image'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.full_name || !formData.company_name))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
