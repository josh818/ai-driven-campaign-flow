import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Target, DollarSign, Calendar, Settings, 
  Facebook, Instagram, Youtube, Search,
  TrendingUp, Users, MapPin, Plus, X, Clock
} from 'lucide-react';

interface PaidAdSettingsProps {
  adSettings: {
    platforms: string[];
    campaignObjective: string;
    targetAudience: {
      demographics: {
        ageRange: [number, number];
        gender: string;
        locations: string[];
        languages: string[];
      };
      interests: string[];
      behaviors: string[];
      customAudiences: string[];
    };
    budgetStrategy: {
      budgetType: string;
      totalBudget: number;
      dailyBudget: number;
      bidStrategy: string;
      maxCPC: number;
    };
    adPlacements: {
      facebook: string[];
      instagram: string[];
      google: string[];
      youtube: string[];
      tiktok: string[];
    };
    scheduling: {
      startDate: string;
      endDate: string;
      dayParting: boolean;
      timeZone: string;
      scheduleSlots: string[];
    };
    optimization: {
      conversionGoal: string;
      roasTarget: number;
      frequencyCap: number;
      autoOptimization: boolean;
    };
  };
  onChange: (field: string, value: any) => void;
}

const PaidAdSettings = ({ adSettings, onChange }: PaidAdSettingsProps) => {
  const [newInterest, setNewInterest] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');

  const adPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="h-4 w-4" /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-4 w-4" /> },
    { id: 'google', name: 'Google Ads', icon: <Search className="h-4 w-4" /> },
    { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-4 w-4" /> },
    { id: 'tiktok', name: 'TikTok', icon: <Target className="h-4 w-4" /> }
  ];

  const togglePlatform = (platform: string) => {
    const current = adSettings.platforms;
    const updated = current.includes(platform) 
      ? current.filter(p => p !== platform)
      : [...current, platform];
    onChange('platforms', updated);
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const current = adSettings.targetAudience.interests;
      onChange('targetAudience', {
        ...adSettings.targetAudience,
        interests: [...current, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    const current = adSettings.targetAudience.interests;
    onChange('targetAudience', {
      ...adSettings.targetAudience,
      interests: current.filter((_, i) => i !== index)
    });
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      const current = adSettings.targetAudience.demographics.locations;
      onChange('targetAudience', {
        ...adSettings.targetAudience,
        demographics: {
          ...adSettings.targetAudience.demographics,
          locations: [...current, newLocation.trim()]
        }
      });
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    const current = adSettings.targetAudience.demographics.locations;
    onChange('targetAudience', {
      ...adSettings.targetAudience,
      demographics: {
        ...adSettings.targetAudience.demographics,
        locations: current.filter((_, i) => i !== index)
      }
    });
  };

  const addTimeSlot = () => {
    if (newTimeSlot.trim()) {
      const current = adSettings.scheduling.scheduleSlots;
      onChange('scheduling', {
        ...adSettings.scheduling,
        scheduleSlots: [...current, newTimeSlot.trim()]
      });
      setNewTimeSlot('');
    }
  };

  const removeTimeSlot = (index: number) => {
    const current = adSettings.scheduling.scheduleSlots;
    onChange('scheduling', {
      ...adSettings.scheduling,
      scheduleSlots: current.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Paid Ad Campaign Settings</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Configure advanced targeting, budget optimization, and performance goals</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="targeting">Targeting</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Ad Platforms</Label>
              <p className="text-sm text-gray-600 mb-4">Select platforms for your paid advertising campaign</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {adPlatforms.map(platform => (
                  <Button
                    key={platform.id}
                    type="button"
                    variant={adSettings.platforms.includes(platform.id) ? "default" : "outline"}
                    className="flex flex-col items-center space-y-2 p-4 h-auto"
                    onClick={() => togglePlatform(platform.id)}
                  >
                    {platform.icon}
                    <span className="text-xs">{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Campaign Objective</Label>
              <Select 
                value={adSettings.campaignObjective} 
                onValueChange={(value) => onChange('campaignObjective', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="app_installs">App Installs</SelectItem>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="catalog_sales">Catalog Sales</SelectItem>
                  <SelectItem value="store_visits">Store Visits</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Demographics</Label>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Age Range: {adSettings.targetAudience.demographics.ageRange[0]} - {adSettings.targetAudience.demographics.ageRange[1]}</Label>
                    <Slider
                      value={adSettings.targetAudience.demographics.ageRange}
                      onValueChange={(value) => onChange('targetAudience', {
                        ...adSettings.targetAudience,
                        demographics: {
                          ...adSettings.targetAudience.demographics,
                          ageRange: value as [number, number]
                        }
                      })}
                      min={13}
                      max={65}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Gender</Label>
                    <Select 
                      value={adSettings.targetAudience.demographics.gender} 
                      onValueChange={(value) => onChange('targetAudience', {
                        ...adSettings.targetAudience,
                        demographics: {
                          ...adSettings.targetAudience.demographics,
                          gender: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Locations</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add location (e.g., United States, New York)"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addLocation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {adSettings.targetAudience.demographics.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{location}</span>
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeLocation(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Interests & Behaviors</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add interest or behavior (e.g., fitness, online shopping)"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button type="button" variant="outline" size="sm" onClick={addInterest}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {adSettings.targetAudience.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{interest}</span>
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(index)} />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Budget Strategy</Label>
                <Select 
                  value={adSettings.budgetStrategy.budgetType} 
                  onValueChange={(value) => onChange('budgetStrategy', {
                    ...adSettings.budgetStrategy,
                    budgetType: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Budget</SelectItem>
                    <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                    <SelectItem value="campaign">Campaign Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Bidding Strategy</Label>
                <Select 
                  value={adSettings.budgetStrategy.bidStrategy} 
                  onValueChange={(value) => onChange('budgetStrategy', {
                    ...adSettings.budgetStrategy,
                    bidStrategy: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bidding strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                    <SelectItem value="cost_cap">Cost Cap</SelectItem>
                    <SelectItem value="bid_cap">Bid Cap</SelectItem>
                    <SelectItem value="target_cost">Target Cost</SelectItem>
                    <SelectItem value="minimum_roas">Minimum ROAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  {adSettings.budgetStrategy.budgetType === 'daily' ? 'Daily Budget ($)' : 'Total Budget ($)'}
                </Label>
                <Input
                  type="number"
                  placeholder="Enter budget amount"
                  value={adSettings.budgetStrategy.budgetType === 'daily' ? adSettings.budgetStrategy.dailyBudget : adSettings.budgetStrategy.totalBudget}
                  onChange={(e) => onChange('budgetStrategy', {
                    ...adSettings.budgetStrategy,
                    [adSettings.budgetStrategy.budgetType === 'daily' ? 'dailyBudget' : 'totalBudget']: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Max Cost Per Click ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.50"
                  value={adSettings.budgetStrategy.maxCPC}
                  onChange={(e) => onChange('budgetStrategy', {
                    ...adSettings.budgetStrategy,
                    maxCPC: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Campaign Duration</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={adSettings.scheduling.startDate}
                      onChange={(e) => onChange('scheduling', {
                        ...adSettings.scheduling,
                        startDate: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="date"
                      value={adSettings.scheduling.endDate}
                      onChange={(e) => onChange('scheduling', {
                        ...adSettings.scheduling,
                        endDate: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Ad Scheduling</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Day-parting</h4>
                    <p className="text-sm text-gray-600">Show ads only at specific times</p>
                  </div>
                  <Switch 
                    checked={adSettings.scheduling.dayParting}
                    onCheckedChange={(checked) => onChange('scheduling', {
                      ...adSettings.scheduling,
                      dayParting: checked
                    })}
                  />
                </div>

                {adSettings.scheduling.dayParting && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="e.g., Mon-Fri 9:00AM-5:00PM"
                        value={newTimeSlot}
                        onChange={(e) => setNewTimeSlot(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTimeSlot()}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {adSettings.scheduling.scheduleSlots.map((slot, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{slot}</span>
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTimeSlot(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Conversion Goal</Label>
                <Select 
                  value={adSettings.optimization.conversionGoal} 
                  onValueChange={(value) => onChange('optimization', {
                    ...adSettings.optimization,
                    conversionGoal: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conversion goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchases">Purchases</SelectItem>
                    <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                    <SelectItem value="leads">Lead Generation</SelectItem>
                    <SelectItem value="page_views">Page Views</SelectItem>
                    <SelectItem value="app_installs">App Installs</SelectItem>
                    <SelectItem value="video_views">Video Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Target ROAS</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 3.0 (300% return)"
                  value={adSettings.optimization.roasTarget}
                  onChange={(e) => onChange('optimization', {
                    ...adSettings.optimization,
                    roasTarget: parseFloat(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Frequency Cap</Label>
                <Input
                  type="number"
                  placeholder="Max impressions per user per week"
                  value={adSettings.optimization.frequencyCap}
                  onChange={(e) => onChange('optimization', {
                    ...adSettings.optimization,
                    frequencyCap: parseInt(e.target.value) || 0
                  })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-Optimization</h4>
                    <p className="text-sm text-gray-600">Let AI optimize your campaigns automatically</p>
                  </div>
                  <Switch 
                    checked={adSettings.optimization.autoOptimization}
                    onCheckedChange={(checked) => onChange('optimization', {
                      ...adSettings.optimization,
                      autoOptimization: checked
                    })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaidAdSettings;