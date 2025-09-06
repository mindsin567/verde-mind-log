import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Smile, Target, BarChart3, PieChart, Activity, Award, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { moodService } from "@/services/moodService";

// Mock data for charts and statistics
const weeklyMoodData = [
  { day: 'Mon', mood: 'Happy', score: 8 },
  { day: 'Tue', mood: 'Content', score: 7 },
  { day: 'Wed', mood: 'Stressed', score: 4 },
  { day: 'Thu', mood: 'Peaceful', score: 9 },
  { day: 'Fri', mood: 'Excited', score: 8 },
  { day: 'Sat', mood: 'Relaxed', score: 9 },
  { day: 'Sun', mood: 'Happy', score: 8 }
];

const moodDistribution = [
  { mood: 'Happy', count: 12, percentage: 35, color: '#10B981' },
  { mood: 'Peaceful', count: 8, percentage: 24, color: '#3B82F6' },
  { mood: 'Content', count: 7, percentage: 21, color: '#8B5CF6' },
  { mood: 'Excited', count: 4, percentage: 12, color: '#F59E0B' },
  { mood: 'Stressed', count: 3, percentage: 8, color: '#EF4444' }
];

const insights = [
  {
    title: "Mood Improvement",
    description: "Your average mood increased by 15% this month",
    type: "positive",
    icon: TrendingUp
  },
  {
    title: "Consistency Win",
    description: "You've logged your mood 6 days in a row",
    type: "streak",
    icon: Award
  },
  {
    title: "Peak Hours",
    description: "You feel happiest in the morning (8-10 AM)",
    type: "insight",
    icon: Activity
  },
  {
    title: "Stress Pattern",
    description: "Stress levels tend to be higher on Wednesdays",
    type: "warning",
    icon: BarChart3
  }
];

export default function Summary() {
  const [timeRange, setTimeRange] = useState("7d");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    totalEntries: 0,
    streak: 0,
    improvement: 0
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, timeRange]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Calculate date range
      const now = new Date();
      let daysBack = 7;
      switch (timeRange) {
        case '30d': daysBack = 30; break;
        case '90d': daysBack = 90; break;
        case '1y': daysBack = 365; break;
      }
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch mood logs
      const { data: moods } = await supabase
        .from('moodlogs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (moods) {
        setMoodLogs(moods);
        
        // Calculate stats
        const moodScores = moods.map(mood => {
          // Convert emoji to score (simple mapping)
          const emojiScores: { [key: string]: number } = {
            '😊': 9, '😄': 10, '😁': 9, '🙂': 8, '😌': 7,
            '😐': 5, '😔': 3, '😢': 2, '😭': 1, '😤': 4,
            '😴': 6, '🤗': 8, '😎': 9, '🥰': 10, '😍': 10
          };
          return emojiScores[mood.emoji] || 5;
        });

        const averageMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;
        
        setStats({
          averageMood,
          totalEntries: moods.length,
          streak: calculateStreak(moods),
          improvement: calculateImprovement(moodScores)
        });
      }

      // Auto-generate summary if user has data
      if (moods && moods.length > 0) {
        generateAISummary();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateStreak = (moods: any[]) => {
    if (!moods.length) return 0;
    
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    for (let i = 0; i < moods.length; i++) {
      const moodDate = new Date(moods[i].date);
      const daysDiff = Math.floor((currentDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateImprovement = (scores: number[]) => {
    if (scores.length < 2) return 0;
    
    const firstHalf = scores.slice(-Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(0, Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  };

  const generateAISummary = async () => {
    if (!user || isGenerating) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { timeRange }
      });

      if (error) {
        console.error('Error generating summary:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI summary. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setAiSummary(data.summary);
      setRecommendations(data.recommendations);
      
      toast({
        title: "Summary Generated",
        description: "Your personalized wellness summary is ready!",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wellness Summary</h1>
            <p className="text-muted-foreground">Your personal wellness insights</p>
          </div>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 3 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smile className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Mood</p>
                <p className="text-2xl font-bold">{stats.averageMood.toFixed(1)}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entries Logged</p>
                <p className="text-2xl font-bold">{stats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.improvement > 0 ? '+' : ''}{stats.improvement}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Section */}
      {aiSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Personalized AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{aiSummary}</p>
            
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Recommendations for Mental Health:</h4>
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={generateAISummary} 
              disabled={isGenerating}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Mood Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Mood Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyMoodData.map((day) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-8">{day.day}</span>
                        <Badge variant="outline" className="text-xs">
                          {day.mood}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={day.score * 10} className="w-20" />
                        <span className="text-sm text-muted-foreground w-8">{day.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mood Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Mood Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodDistribution.map((item) => (
                    <div key={item.mood} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.mood}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentage} className="w-16" />
                        <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">87%</div>
                  <p className="text-muted-foreground">Goal Completion Rate</p>
                  <Progress value={87} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Day Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saturday</span>
                  <Badge>Best Day</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning (8-10 AM)</span>
                  <Badge variant="secondary">Peak Hours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">After Exercise</span>
                  <Badge variant="secondary">Mood Booster</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'positive' ? 'bg-emerald-500/10' :
                      insight.type === 'streak' ? 'bg-amber-500/10' :
                      insight.type === 'warning' ? 'bg-red-500/10' :
                      'bg-primary/10'
                    }`}>
                      <insight.icon className={`h-5 w-5 ${
                        insight.type === 'positive' ? 'text-emerald-500' :
                        insight.type === 'streak' ? 'text-amber-500' :
                        insight.type === 'warning' ? 'text-red-500' :
                        'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              Export PDF Report
            </Button>
            <Button variant="outline">
              Download CSV Data
            </Button>
            <Button variant="outline">
              Share Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}