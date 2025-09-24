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

      {/* AI Recommendations Section */}
      {aiSummary && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Weekly Summary:</h4>
              <p className="text-sm leading-relaxed mb-4">{aiSummary}</p>
            </div>
            
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Personalized Recommendations:</h4>
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
                  Generate New Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generate button for users without summary */}
      {!aiSummary && user && stats.totalEntries > 0 && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get Your Weekly Recommendations</h3>
            <p className="text-muted-foreground mb-4">
              Generate personalized weekly mental health recommendations based on your mood logs from Monday to Sunday.
            </p>
            <Button onClick={generateAISummary} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Recommendations
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
            {/* Recent Mood Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Mood Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodLogs.length > 0 ? (
                  <div className="space-y-3">
                    {moodLogs.slice(0, 7).map((log, index) => (
                      <div key={log.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-12">
                            {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-lg">{log.emoji}</span>
                          {log.note && (
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {log.note}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(log.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Smile className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No mood logs yet</p>
                    <p className="text-sm text-muted-foreground">Start tracking your mood to see insights here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mood Tracking Consistency</span>
                      <span>{stats.totalEntries > 0 ? Math.min(100, (stats.totalEntries / parseInt(timeRange.replace('d', '')) * 100)).toFixed(0) : 0}%</span>
                    </div>
                    <Progress value={stats.totalEntries > 0 ? Math.min(100, (stats.totalEntries / parseInt(timeRange.replace('d', '')) * 100)) : 0} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Streak</span>
                      <span>{stats.streak} days</span>
                    </div>
                    <Progress value={Math.min(100, stats.streak * 10)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Mood Score</span>
                      <span>{stats.averageMood.toFixed(1)}/10</span>
                    </div>
                    <Progress value={stats.averageMood * 10} />
                  </div>
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
                  <div className="text-4xl font-bold text-primary">
                    {stats.totalEntries > 0 ? Math.round((stats.totalEntries / parseInt(timeRange.replace('d', '')) * 100)) : 0}%
                  </div>
                  <p className="text-muted-foreground">Mood Tracking Completion</p>
                  <Progress value={stats.totalEntries > 0 ? Math.min(100, (stats.totalEntries / parseInt(timeRange.replace('d', '')) * 100)) : 0} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.streak > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <Badge>{stats.streak} days</Badge>
                  </div>
                )}
                {stats.averageMood > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Mood</span>
                    <Badge variant="secondary">{stats.averageMood.toFixed(1)}/10</Badge>
                  </div>
                )}
                {stats.improvement !== 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mood Trend</span>
                    <Badge variant={stats.improvement > 0 ? "default" : "secondary"}>
                      {stats.improvement > 0 ? "+" : ""}{stats.improvement}%
                    </Badge>
                  </div>
                )}
                {stats.totalEntries === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">No data available yet</p>
                    <p className="text-muted-foreground text-xs">Start logging your mood to see patterns</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {stats.totalEntries > 0 ? (
              <>
                {stats.improvement > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Mood Improvement</h3>
                          <p className="text-sm text-muted-foreground">
                            Your mood has improved by {stats.improvement}% over the selected period
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {stats.streak > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Award className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Consistency Achievement</h3>
                          <p className="text-sm text-muted-foreground">
                            You've been tracking your mood for {stats.streak} consecutive days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stats.averageMood >= 7 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">Positive Wellbeing</h3>
                          <p className="text-sm text-muted-foreground">
                            Your average mood score of {stats.averageMood.toFixed(1)} indicates good mental wellbeing
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                  <p className="text-muted-foreground">
                    Start logging your mood regularly to see personalized insights about your mental health patterns.
                  </p>
                </CardContent>
              </Card>
            )}
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