import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodCard } from "@/components/mood/MoodCard";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  Plus,
  Smile,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { moodService } from "@/services/moodService";
import { diaryService } from "@/services/diaryService";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [todayMood, setTodayMood] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    weeklyAverage: 0,
    streakDays: 0,
    totalEntries: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Get today's mood
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMoodData } = await moodService.getMoodLogByDate(user.id, today);
      setTodayMood(todayMoodData?.[0] || null);

      // Get recent mood entries
      const { data: recentMoodData } = await moodService.getRecentMoods(user.id, 3);
      setRecentEntries(recentMoodData || []);

      // Calculate basic stats
      const { data: allMoods } = await moodService.getRecentMoods(user.id, 30);
      const totalEntries = allMoods?.length || 0;
      
      setStats({
        weeklyAverage: totalEntries > 0 ? 3.8 : 0, // Mock calculation for now
        streakDays: totalEntries > 0 ? Math.min(totalEntries, 7) : 0,
        totalEntries
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good morning, {profile?.name || 'User'}! 🌱</h1>
          <p className="text-muted-foreground mt-1">
            How are you feeling today? Take a moment to check in with yourself.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/mood">
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Log Mood
            </Button>
          </Link>
          <Link to="/diary">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              Write Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="wellness-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground">Weekly Average</CardDescription>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.weeklyAverage}/5</div>
            <p className="text-xs text-success font-medium mt-1">+0.3 from last week</p>
          </CardContent>
        </Card>

        <Card className="wellness-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground">Current Streak</CardDescription>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.streakDays} days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it up! 🔥</p>
          </CardContent>
        </Card>

        <Card className="wellness-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-muted-foreground">Total Entries</CardDescription>
              <Smile className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Mood */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Today's Check-in</h2>
          {todayMood && (
            <Badge variant="secondary" className="bg-wellness-calm text-foreground">
              Latest
            </Badge>
          )}
        </div>
        {todayMood ? (
          <MoodCard entry={todayMood} />
        ) : (
          <Card className="wellness-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No mood logged today yet</p>
              <Link to="/mood">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your Mood
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="wellness-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common wellness activities to help you throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/chat">
              <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-wellness-focus">
                <div className="text-left">
                  <div className="font-medium">Chat with AI Companion</div>
                  <div className="text-sm text-muted-foreground">Get personalized support and guidance</div>
                </div>
              </Button>
            </Link>
            <Link to="/summary">
              <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-wellness-warm">
                <div className="text-left">
                  <div className="font-medium">View Weekly Summary</div>
                  <div className="text-sm text-muted-foreground">See your progress and insights</div>
                </div>
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-wellness-calm">
              <div className="text-left">
                <div className="font-medium">Breathing Exercise</div>
                <div className="text-sm text-muted-foreground">Take a 2-minute mindful break</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="wellness-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest mood entries and journal reflections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <MoodCard key={entry.id} entry={entry} compact />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent entries yet</p>
            )}
            <Link to="/mood">
              <Button variant="ghost" className="w-full text-primary hover:bg-primary/10">
                View All Entries
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}