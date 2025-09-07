import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "@/components/mood/EmojiPicker";
import { MoodCard } from "@/components/mood/MoodCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { moodService, type MoodLog } from "@/services/moodService";

export default function MoodLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [recentMoods, setRecentMoods] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentMoods();
    }
  }, [user]);

  const loadRecentMoods = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await moodService.getRecentMoods(user.id, 10);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load recent moods",
        variant: "destructive"
      });
    } else if (data) {
      setRecentMoods(data);
    }
    
    setIsLoading(false);
  };

  const handleMoodSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleSave = async () => {
    if (!user || !selectedEmoji) return;
    
    setIsSaving(true);
    
    const { data, error } = await moodService.createMoodLog(user.id, {
      emoji: selectedEmoji,
      note: note || undefined,
      date: new Date().toISOString().split('T')[0]
    });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to save mood log",
        variant: "destructive"
      });
    } else if (data) {
      setRecentMoods([data, ...recentMoods]);
      toast({
        title: "Mood logged successfully! 🌱",
        description: "Your mood has been saved to your wellness journal.",
      });
      setSelectedEmoji("");
      setNote("");
    }
    
    setIsSaving(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(recentMoods, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported!",
      description: "Your mood logs have been downloaded."
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mood Check-in</h1>
            <p className="text-muted-foreground">
              Take a moment to reflect on how you're feeling right now
            </p>
          </div>
        </div>
        <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mood Entry Form */}
        <div className="space-y-6">
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>Log Your Current Mood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmojiPicker 
                onSelect={handleMoodSelect}
                selectedEmoji={selectedEmoji}
              />
              
              {selectedEmoji && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Add a note (optional)
                    </label>
                    <Textarea
                      placeholder="What's on your mind? How are you feeling right now?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] rounded-xl border-border focus:border-primary"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Mood Entry
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="wellness-card bg-wellness-warm border-warning/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">💡 Mindful Tip</h3>
              <p className="text-sm text-muted-foreground">
                Remember, all feelings are valid. Acknowledging your emotions is the first 
                step toward understanding and managing them effectively.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Moods */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Entries</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending up
            </Badge>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading recent moods...</div>
            ) : recentMoods.length === 0 ? (
              <div className="text-center text-muted-foreground">No mood entries yet. Log your first mood above!</div>
            ) : (
              recentMoods.map((mood) => (
                <MoodCard key={mood.id} entry={mood} compact />
              ))
            )}
          </div>

          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl">
            View All Mood History
          </Button>
        </div>
      </div>
    </div>
  );
}