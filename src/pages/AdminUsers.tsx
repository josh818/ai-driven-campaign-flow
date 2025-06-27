
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AdminRole = Database['public']['Tables']['admin_roles']['Row'];

interface UserWithAdmin extends Profile {
  admin_roles?: AdminRole[];
  campaign_count?: number;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with admin roles and campaign counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          admin_roles(*),
          campaigns(id)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform the data to include campaign counts
      const usersWithCounts = profiles?.map(profile => ({
        ...profile,
        campaign_count: profile.campaigns?.length || 0,
        campaigns: undefined // Remove the campaigns array since we only need the count
      })) || [];

      setUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const makeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .insert({
          user_id: userId,
          granted_by: user!.id
        });

      if (error) throw error;
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Header />
      
      <AdminGuard>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600">
              Manage users, assign admin roles, and create campaigns for users.
            </p>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <span>All Users</span>
                </div>
                <Badge variant="secondary">{filteredUsers.length} users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((userProfile) => (
                    <div
                      key={userProfile.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {userProfile.full_name?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {userProfile.full_name || 'Unnamed User'}
                              </h3>
                              {userProfile.admin_roles && userProfile.admin_roles.length > 0 && (
                                <Badge variant="default" className="bg-red-100 text-red-800">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{userProfile.email}</span>
                              </div>
                              
                              {userProfile.company_name && (
                                <span>• {userProfile.company_name}</span>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{userProfile.campaign_count || 0} campaigns</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link to={`/admin/users/${userProfile.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          </Link>
                          
                          <Link to={`/admin/users/${userProfile.id}/create-campaign`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Campaign
                            </Button>
                          </Link>
                          
                          {userProfile.admin_roles && userProfile.admin_roles.length > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAdmin(userProfile.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Remove Admin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => makeAdmin(userProfile.id)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </AdminGuard>
    </div>
  );
};

export default AdminUsers;
