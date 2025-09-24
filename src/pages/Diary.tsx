import { useState, useEffect } from "react";
import { Calendar, Plus, Search, BookOpen, Edit3, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { diaryService, type DiaryEntry } from "@/services/diaryService";
import { useToast } from "@/hooks/use-toast";

export default function Diary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: ""
  });

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await diaryService.getDiaryEntries(user.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load diary entries",
        variant: "destructive"
      });
    } else if (data) {
      setEntries(data);
    }
    
    setIsLoading(false);
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.mood && entry.mood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateEntry = async () => {
    if (!user || !newEntry.title || !newEntry.content) return;
    
    setIsSaving(true);
    const { data, error } = await diaryService.createDiaryEntry(user.id, {
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood || undefined
    });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to save diary entry",
        variant: "destructive"
      });
    } else if (data) {
      setEntries([data, ...entries]);
      setNewEntry({ title: "", content: "", mood: "" });
      setIsNewEntryOpen(false);
      toast({
        title: "Entry saved!",
        description: "Your diary entry has been saved successfully."
      });
    }
    
    setIsSaving(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    const { error } = await diaryService.deleteDiaryEntry(user.id, id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete diary entry",
        variant: "destructive"
      });
    } else {
      setEntries(entries.filter(entry => entry.id !== id));
      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted."
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diary-entries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported!",
      description: "Your diary entries have been downloaded."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-focus to-wellness-calm/30">
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="wellness-card border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Personal Diary
                </h1>
                <p className="text-muted-foreground text-lg">Capture your thoughts and memories</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleExportData} 
                variant="outline" 
                className="flex items-center gap-2 bg-background/50 hover:bg-background/80 border-primary/20 hover:border-primary/40"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-lg">
                    <Plus className="h-4 w-4" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-0 bg-card/95 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Create New Diary Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                      <Input
                        id="title"
                        placeholder="Give your entry a title..."
                        value={newEntry.title}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-background/50 border-primary/20 focus:border-primary/40"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm font-medium">Your Thoughts</Label>
                      <Textarea
                        id="content"
                        placeholder="What's on your mind today..."
                        className="min-h-[200px] bg-background/50 border-primary/20 focus:border-primary/40 resize-none"
                        value={newEntry.content}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mood" className="text-sm font-medium">Current Mood</Label>
                      <Input
                        id="mood"
                        placeholder="How are you feeling?"
                        value={newEntry.mood}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, mood: e.target.value }))}
                        className="bg-background/50 border-primary/20 focus:border-primary/40"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleCreateEntry} 
                        disabled={!newEntry.title || !newEntry.content || isSaving}
                        className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary"
                      >
                        {isSaving ? "Creating..." : "Create Entry"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="wellness-card border-0 bg-card/60 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search your entries..."
              className="pl-12 h-12 bg-background/50 border-primary/20 focus:border-primary/40 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="wellness-card border-0 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-md">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Entries</p>
                <p className="text-3xl font-bold text-foreground">{entries.length}</p>
              </div>
            </div>
          </div>

          <div className="wellness-card border-0 bg-gradient-to-br from-wellness-focus to-accent/20 hover:from-wellness-focus hover:to-accent/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-md">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">This Month</p>
                <p className="text-3xl font-bold text-foreground">
                  {entries.filter(entry => {
                    const entryDate = new Date(entry.created_at);
                    const now = new Date();
                    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="wellness-card border-0 bg-gradient-to-br from-wellness-warm to-warning/10 hover:from-wellness-warm hover:to-warning/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-warning to-warning/80 rounded-xl shadow-md">
                <Edit3 className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Words</p>
                <p className="text-3xl font-bold text-foreground">
                  {entries.reduce((total, entry) => total + entry.word_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="wellness-card border-0 bg-card/60 backdrop-blur-sm">
              <div className="p-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto"></div>
                  <p className="text-muted-foreground">Loading your entries...</p>
                </div>
              </div>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="wellness-card border-0 bg-gradient-to-br from-card/80 to-wellness-calm/20 backdrop-blur-sm">
              <div className="p-12 text-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto">
                  <BookOpen className="h-16 w-16 text-primary mx-auto" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">No entries found</h3>
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? "Try adjusting your search terms" : "Start your journaling journey today"}
                  </p>
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsNewEntryOpen(true)}
                    className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Entry
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="wellness-card border-0 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm hover:from-card hover:to-card/80 group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="bg-background/50 border-primary/20">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Badge>
                        {entry.mood && (
                          <Badge className="bg-gradient-to-r from-wellness-calm to-accent/50 text-accent-foreground">
                            {entry.mood}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                          {entry.word_count} words
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {entry.content.length > 250 ? `${entry.content.substring(0, 250)}...` : entry.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}