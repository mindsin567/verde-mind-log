import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "@/components/mood/EmojiPicker";
import { MoodCard } from "@/components/mood/MoodCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function MoodLog() {
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mock recent mood entries
  const recentMoods = [
    {
      id: "1",
      emoji: "😊",
      note: "Had a great morning coffee and feeling positive!",
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      emoji: "😌",
      note: "",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      emoji: "🤔",
      note: "Reflecting on yesterday's events and planning ahead",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleMoodSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleSave = async () => {
    if (!selectedEmoji) return;
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Mood logged successfully! 🌱",
      description: "Your mood has been saved to your wellness journal.",
    });
    
    setIsSaving(false);
    setSelectedEmoji("");
    setNote("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
            {recentMoods.map((mood) => (
              <MoodCard key={mood.id} entry={mood} compact />
            ))}
          </div>

          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl">
            View All Mood History
          </Button>
        </div>
      </div>
    </div>
  );
}