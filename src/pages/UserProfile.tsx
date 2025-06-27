
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  Plus,
  ArrowLeft,
  Target,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type AdminRole = Database['public']['Tables']['admin_roles']['Row'];

interface UserWithDetails extends Profile {
  admin_roles?: AdminRole[];
  campaigns?: Campaign[];
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId && user) {
      fetchUserProfile();
    }
  }, [userId, user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          admin_roles(*),
          campaigns(*)
        `)
        .eq('id', userId!)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
            <Link to="/admin/users">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      <AdminGuard>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Users
                </Button>
              </Link>
              <h2 className="text-3xl font-bold text-gray-900">User Profile</h2>
              <p className="text-gray-600">
                Manage campaigns and settings for {userProfile.full_name || userProfile.email}
              </p>
            </div>
            
            <Link to={`/admin/users/${userId}/create-campaign`}>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {userProfile.full_name?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {userProfile.full_name || 'Unnamed User'}
                  </h3>
                  
                  {userProfile.admin_roles && userProfile.admin_roles.length > 0 && (
                    <Badge className="bg-red-100 text-red-800 mb-4">
                      Administrator
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{userProfile.email}</span>
                  </div>
                  
                  {userProfile.company_name && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{userProfile.company_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Joined {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats and Campaigns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {userProfile.campaigns?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {userProfile.campaigns?.filter(c => c.status === 'active').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-teal-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {userProfile.campaigns?.filter(c => c.status === 'completed').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Campaigns List */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>User Campaigns</span>
                    <Badge variant="secondary">
                      {userProfile.campaigns?.length || 0} campaigns
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!userProfile.campaigns || userProfile.campaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-4">No campaigns created yet.</p>
                      <Link to={`/admin/users/${userId}/create-campaign`}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Campaign
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userProfile.campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {campaign.title}
                            </h4>
                            <Badge className={getStatusBadge(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                          
                          {campaign.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Created {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                            <Link
                              to={`/campaigns/${campaign.id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </AdminGuard>
    </div>
  );
};

export default UserProfile;
