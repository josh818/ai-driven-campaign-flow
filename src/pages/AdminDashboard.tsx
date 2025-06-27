import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminGuard from '@/components/AdminGuard';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Settings, 
  Shield, 
  Plus, 
  Search,
  UserPlus,
  Eye,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  onboarding_completed: boolean;
  created_at: string;
}

interface MonitoredTerm {
  id: string;
  term: string;
  user_id: string;
  created_at: string;
  user_email?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTerms: 0,
    completedOnboarding: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchMonitoredTerms();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setStats(prev => ({
        ...prev,
        totalUsers: data?.length || 0,
        completedOnboarding: data?.filter(u => u.onboarding_completed).length || 0,
        activeUsers: data?.length || 0 // For now, all users are considered active
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchMonitoredTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('monitored_terms')
        .select(`
          *,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const termsWithEmail = data?.map(term => ({
        ...term,
        user_email: term.profiles?.email
      })) || [];

      setMonitoredTerms(termsWithEmail);
      setStats(prev => ({
        ...prev,
        totalTerms: termsWithEmail.length
      }));
    } catch (error) {
      console.error('Error fetching monitored terms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch monitored terms",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMonitoredTerm = async () => {
    if (!newTerm.trim() || !selectedUserId) {
      toast({
        title: "Error",
        description: "Please enter a term and select a user",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('monitored_terms')
        .insert({
          term: newTerm.trim(),
          user_id: selectedUserId
        });

      if (error) throw error;

      setNewTerm('');
      setSelectedUserId('');
      fetchMonitoredTerms();
      toast({
        title: "Success",
        description: "Monitored term added successfully"
      });
    } catch (error) {
      console.error('Error adding monitored term:', error);
      toast({
        title: "Error",
        description: "Failed to add monitored term",
        variant: "destructive"
      });
    }
  };

  const deleteMonitoredTerm = async (termId: string) => {
    try {
      const { error } = await supabase
        .from('monitored_terms')
        .delete()
        .eq('id', termId);

      if (error) throw error;

      fetchMonitoredTerms();
      toast({
        title: "Success",
        description: "Monitored term deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting monitored term:', error);
      toast({
        title: "Error",
        description: "Failed to delete monitored term",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTerms = monitoredTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, campaigns, and reputation monitoring</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Onboarding</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedOnboarding}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monitored Terms</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTerms}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users, terms, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users Management */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>User Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.company_name && (
                              <p className="text-xs text-gray-500">{user.company_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.onboarding_completed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reputation Monitoring */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <span>Reputation Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add New Term */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Add Monitored Term</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="term">Term to Monitor</Label>
                      <Input
                        id="term"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        placeholder="Enter brand name, product, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="user">Assign to User</Label>
                      <select
                        id="user"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.email} - {user.full_name || 'No name'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={addMonitoredTerm} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Term
                    </Button>
                  </div>
                </div>

                {/* Existing Terms */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Existing Terms</h3>
                  {filteredTerms.map((term) => (
                    <div key={term.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{term.term}</p>
                        <p className="text-sm text-gray-600">{term.user_email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMonitoredTerm(term.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Manage All Users
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/create-campaign">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/analytics">
                      <Shield className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
