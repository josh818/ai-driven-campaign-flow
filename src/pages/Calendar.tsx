
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

interface ScheduledContent {
  id: string;
  content_text: string;
  content_type: string;
  platform: string;
  scheduled_for: string;
  status: string;
  campaign: {
    title: string;
    brand_name: string;
  };
}

const Calendar = () => {
  const { user } = useAuth();
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchScheduledContent();
    }
  }, [user, currentDate]);

  const fetchScheduledContent = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('campaign_content')
        .select(`
          *,
          campaigns!inner(title, brand_name, user_id)
        `)
        .not('scheduled_for', 'is', null)
        .gte('scheduled_for', startOfMonth.toISOString())
        .lte('scheduled_for', endOfMonth.toISOString())
        .eq('campaigns.user_id', user?.id);

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        campaign: {
          title: item.campaigns.title,
          brand_name: item.campaigns.brand_name
        }
      })) || [];

      setScheduledContent(formattedData);
    } catch (error) {
      console.error('Error fetching scheduled content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getContentForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return scheduledContent.filter(content => 
      content.scheduled_for?.startsWith(dateString)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const selectedDateContent = getContentForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaign Calendar</h2>
          <p className="text-gray-600">View and manage your scheduled content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayContent = getContentForDate(day);
                    const isSelected = day && selectedDate.toDateString() === day.toDateString();
                    const isToday = day && new Date().toDateString() === day.toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[80px] p-2 border rounded cursor-pointer transition-colors
                          ${day ? 'hover:bg-gray-50' : ''}
                          ${isSelected ? 'bg-purple-100 border-purple-300' : 'border-gray-200'}
                          ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                        `}
                        onClick={() => day && setSelectedDate(day)}
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayContent.slice(0, 2).map((content, i) => (
                                <div
                                  key={i}
                                  className="text-xs bg-purple-100 text-purple-800 rounded px-1 py-0.5 truncate"
                                >
                                  {content.content_type}
                                </div>
                              ))}
                              {dayContent.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{dayContent.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  {selectedDateContent.length} scheduled items
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateContent.length === 0 ? (
                  <p className="text-gray-500 text-sm">No content scheduled for this date</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDateContent.map((content) => (
                      <div key={content.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">
                            {content.content_type}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(content.scheduled_for).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 mb-1 font-medium">
                          {content.campaign.title}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {content.campaign.brand_name}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {content.content_text}
                        </p>
                        {content.platform && (
                          <Badge variant="outline" className="mt-2">
                            {content.platform}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
