import { useState } from "react";
import { Calendar, Plus, Search, BookOpen, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  mood?: string;
  word_count: number;
}

// Mock data
const mockEntries: DiaryEntry[] = [
  {
    id: "1",
    title: "A Peaceful Morning",
    content: "Started my day with meditation and felt incredibly centered. The sunrise was beautiful and I felt grateful for this moment of tranquility...",
    created_at: "2024-01-15T10:00:00Z",
    mood: "Peaceful",
    word_count: 25
  },
  {
    id: "2", 
    title: "Challenging Day at Work",
    content: "Today was tough with multiple deadlines. However, I managed to stay focused and complete everything on time. Feeling proud of my resilience...",
    created_at: "2024-01-14T18:00:00Z",
    mood: "Determined",
    word_count: 28
  },
  {
    id: "3",
    title: "Quality Time with Family",
    content: "Spent the evening with loved ones. We cooked dinner together and shared stories. These moments remind me what truly matters in life...",
    created_at: "2024-01-13T20:00:00Z",
    mood: "Joyful",
    word_count: 26
  }
];

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(mockEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: ""
  });

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.mood && entry.mood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateEntry = () => {
    if (newEntry.title && newEntry.content) {
      const wordCount = newEntry.content.split(/\s+/).filter(word => word.length > 0).length;
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        title: newEntry.title,
        content: newEntry.content,
        created_at: new Date().toISOString(),
        mood: newEntry.mood,
        word_count: wordCount
      };
      setEntries([entry, ...entries]);
      setNewEntry({ title: "", content: "", mood: "" });
      setIsNewEntryOpen(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Personal Diary</h1>
            <p className="text-muted-foreground">Capture your thoughts and memories</p>
          </div>
        </div>

        <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Diary Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your entry a title..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Your Thoughts</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind today..."
                  className="min-h-[200px]"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mood">Current Mood</Label>
                  <Input
                    id="mood"
                    placeholder="How are you feeling?"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, mood: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateEntry} disabled={!newEntry.title || !newEntry.content}>
                  Create Entry
                </Button>
                <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search your entries..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
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
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Edit3 className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">5 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Start your journaling journey today"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsNewEntryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      {entry.mood && (
                        <Badge variant="secondary" className="text-xs">
                          {entry.mood}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {entry.word_count} words
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  {entry.content.length > 200 ? `${entry.content.substring(0, 200)}...` : entry.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}