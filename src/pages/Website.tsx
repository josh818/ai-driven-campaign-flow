import { ArrowRight, Award, BarChart3, Shield, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Website = () => {
  const features = [
    {
      icon: Award,
      title: "20+ Years of Expertise",
      description: "Your campaigns are crafted by seasoned professionals with over two decades of proven marketing experience."
    },
    {
      icon: BarChart3,
      title: "Data-Driven Results",
      description: "Every strategy is backed by advanced analytics and insights to ensure maximum ROI for your investment."
    },
    {
      icon: Shield,
      title: "Brand Protection",
      description: "Real-time monitoring and professional management to protect and enhance your brand reputation."
    },
    {
      icon: Users,
      title: "Dedicated Team",
      description: "Your dedicated team of marketing veterans ensures personalized attention and expert execution."
    }
  ];

  const testimonials = [
    {
      text: "The 20+ years of experience really shows. Our campaigns have never performed better.",
      author: "Sarah Chen",
      title: "Marketing Director, TechStart Inc.",
      rating: 5
    },
    {
      text: "Professional service at its finest. Worth every penny of the investment.",
      author: "Michael Rodriguez",
      title: "CEO, GrowthCorp",
      rating: 5
    },
    {
      text: "The expertise and results speak for themselves. Highly recommended.",
      author: "Emily Watson",
      title: "CMO, ScaleUp Solutions",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl">
                <span className="text-white font-bold text-xl">BB</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BiggerBite.io
                </h1>
                <p className="text-sm text-gray-600">Professional Campaign Management</p>
              </div>
            </div>
            <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-green-100 px-4 py-2 rounded-full border border-blue-200 mb-8">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-medium text-sm">Professional Campaign Excellence Since 2003</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
            Campaigns Crafted by
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Marketing Veterans
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Your marketing campaigns deserve the expertise of professionals with over 20 years of proven success. 
            Every strategy, every piece of content, and every optimization is backed by decades of experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-lg px-8 py-4 rounded-lg font-medium transition-colors inline-flex items-center">
              Start Professional Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">$1,500/month</div>
              <div className="text-sm text-gray-600">Professional expertise included</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">20+</div>
              <div className="text-gray-600">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Successful Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Professional Experience?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team of marketing veterans brings unmatched expertise to every campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our clients say about our professional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Service Investment
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Premium campaigns crafted by marketing veterans.
          </p>

          <Card className="border-2 border-blue-200 shadow-2xl bg-white">
            <CardContent className="p-12">
              <div className="mb-8">
                <div className="text-5xl font-bold text-green-700 mb-2">$1,500</div>
                <div className="text-xl text-gray-600">per month</div>
              </div>
              
              <div className="space-y-4 mb-8">
                {[
                  "20+ years professional expertise",
                  "Dedicated campaign veterans",
                  "Advanced analytics & insights",
                  "Real-time brand monitoring",
                  "Professional content creation",
                  "Multi-platform management"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-lg px-12 py-4 rounded-lg font-medium transition-colors inline-block">
                Get Professional Service
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">BiggerBite.io</h3>
              <p className="text-gray-400">Professional Campaign Management</p>
            </div>
          </div>
          <p className="text-gray-400">
            © 2024 BiggerBite.io. Professional marketing campaigns by industry veterans.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Website;
