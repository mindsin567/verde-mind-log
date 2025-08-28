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

export default function Dashboard() {
  // Mock data - replace with real data later
  const todayMood = {
    id: "1",
    emoji: "😊",
    mood: "Happy",
    note: "Had a great morning coffee and feeling positive about the day ahead!",
    timestamp: new Date(),
    intensity: 4
  };

  const recentEntries = [
    {
      id: "2",
      emoji: "😌",
      mood: "Peaceful",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      intensity: 4
    },
    {
      id: "3",
      emoji: "🤔",
      mood: "Thoughtful",
      note: "Reflecting on yesterday's events",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      intensity: 3
    }
  ];

  const stats = {
    weeklyAverage: 3.8,
    streakDays: 7,
    totalEntries: 24
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good morning! 🌱</h1>
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
          <Badge variant="secondary" className="bg-wellness-calm text-foreground">
            Latest
          </Badge>
        </div>
        <MoodCard entry={todayMood} />
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
            {recentEntries.map((entry) => (
              <MoodCard key={entry.id} entry={entry} compact />
            ))}
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