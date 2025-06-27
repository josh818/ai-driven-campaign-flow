
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  Eye,
  UserPlus,
  AlertCircle,
  Settings,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminGuard from '@/components/AdminGuard';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

interface MonitoredTerm {
  id: string;
  term: string;
  user_id: string;
  created_at: string;
  email?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [monitoredTerms, setMonitoredTerms] = useState<MonitoredTerm[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchMonitoredTerms();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
      } else if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
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

      if (error) {
        console.error('Error fetching monitored terms:', error);
      } else if (data) {
        const termsWithEmail = data.map(term => ({
          ...term,
          email: (term.profiles as any)?.email || 'Unknown'
        }));
        setMonitoredTerms(termsWithEmail);
      }
    } catch (error) {
      console.error('Error fetching monitored terms:', error);
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

      if (error) {
        console.error('Error adding monitored term:', error);
        toast({
          title: "Error",
          description: "Failed to add monitored term",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Monitored term added successfully"
        });
        setNewTerm('');
        setSelectedUserId('');
        fetchMonitoredTerms();
      }
    } catch (error) {
      console.error('Error adding monitored term:', error);
    }
  };

  const removeMonitoredTerm = async (termId: string) => {
    try {
      const { error } = await supabase
        .from('monitored_terms')
        .delete()
        .eq('id', termId);

      if (error) {
        console.error('Error removing monitored term:', error);
        toast({
          title: "Error",
          description: "Failed to remove monitored term",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Monitored term removed successfully"
        });
        fetchMonitoredTerms();
      }
    } catch (error) {
      console.error('Error removing monitored term:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTerms = monitoredTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, campaigns, and system settings</p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Reputation Monitoring
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading users...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {user.full_name || 'No name'}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {user.company_name || 'No company'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                Joined {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Reputation Monitoring Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">Add New Monitoring Term</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="user-select">Select User</Label>
                        <select
                          id="user-select"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Choose a user</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.email} - {user.full_name || 'No name'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="new-term">Monitoring Term</Label>
                        <Input
                          id="new-term"
                          placeholder="Enter term to monitor"
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addMonitoredTerm} className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Term
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredTerms.length === 0 ? (
                      <div className="text-center py-8">
                        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No monitoring terms found</p>
                      </div>
                    ) : (
                      filteredTerms.map((term) => (
                        <div key={term.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{term.term}</p>
                            <p className="text-sm text-gray-600">
                              User: {term.email} • Added {new Date(term.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeMonitoredTerm(term.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Database Status</h3>
                      <p className="text-sm text-gray-600">
                        System is operational. All core features are available.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Onboarding System</h3>
                      <p className="text-sm text-yellow-700">
                        Advanced onboarding features require database migration to be completed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
