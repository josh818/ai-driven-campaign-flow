
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import AdminGuard from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Mail,
  Search,
  Shield,
  Plus,
  Settings,
  Building
} from 'lucide-react';

interface User {
  id: string;
  email?: string;
  full_name?: string;
  company_name?: string;
  created_at: string;
}

interface MonitoredTerm {
  id: string;
  term: string;
  user_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalTerms: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch campaigns count
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id');

      if (campaignsError) throw campaignsError;

      // Try to fetch monitored terms (may not exist yet)
      let termsData: MonitoredTerm[] = [];
      try {
        const { data, error } = await (supabase as any)
          .from('monitored_terms')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error) {
          termsData = data || [];
        }
      } catch (error) {
        console.log('Monitored terms table not available yet');
      }

      setUsers(usersData || []);
      setMonitoredTerms(termsData);
      setStats({
        totalUsers: usersData?.length || 0,
        totalCampaigns: campaignsData?.length || 0,
        totalTerms: termsData.length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addGlobalTerm = async () => {
    if (!newTerm.trim()) return;

    try {
      const { error } = await (supabase as any)
        .from('monitored_terms')
        .insert([{ term: newTerm.trim(), user_id: user?.id }]);

      if (error) throw error;

      setNewTerm('');
      fetchData();
      toast({
        title: "Success",
        description: "Global monitoring term added successfully."
      });
    } catch (error) {
      console.error('Error adding global term:', error);
      toast({
        title: "Error",
        description: "Failed to add monitoring term.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <span>Admin Dashboard</span>
            </h2>
            <p className="text-gray-600">
              Manage users, monitor reputation terms, and oversee campaign performance.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monitored Terms</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTerms}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users Management */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span>User Management</span>
                  </div>
                  <Badge variant="secondary">{filteredUsers.length} users</Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.map((userProfile) => (
                    <div
                      key={userProfile.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {userProfile.full_name?.[0]?.toUpperCase() || userProfile.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {userProfile.full_name || 'Unnamed User'}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span>{userProfile.email}</span>
                              {userProfile.company_name && (
                                <>
                                  <Building className="h-3 w-3" />
                                  <span>{userProfile.company_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Global Reputation Monitoring */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                  <span>Global Reputation Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add global monitoring term..."
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGlobalTerm()}
                    />
                    <Button 
                      onClick={addGlobalTerm}
                      className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {monitoredTerms.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No global monitoring terms configured
                      </p>
                    ) : (
                      monitoredTerms.map((term) => (
                        <div key={term.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{term.term}</span>
                          <Badge variant="secondary">Global</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </AdminGuard>
    </div>
  );
};

export default AdminDashboard;
