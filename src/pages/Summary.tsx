import { useState } from "react";
import { TrendingUp, Calendar, Smile, Target, BarChart3, PieChart, Activity, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case "7d": return "Last 7 Days";
      case "30d": return "Last 30 Days";
      case "90d": return "Last 3 Months";
      case "1y": return "Last Year";
      default: return "Last 7 Days";
    }
  };

  const averageMood = weeklyMoodData.reduce((sum, day) => sum + day.score, 0) / weeklyMoodData.length;

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
                <p className="text-2xl font-bold">{averageMood.toFixed(1)}/10</p>
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
                <p className="text-2xl font-bold">34</p>
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
                <p className="text-2xl font-bold">6 days</p>
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
                <p className="text-2xl font-bold text-emerald-500">+15%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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