import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MoodEntry {
  id: string;
  emoji: string;
  note?: string;
  date: string;
  created_at: string;
}

interface MoodCardProps {
  entry: MoodEntry;
  compact?: boolean;
}

export function MoodCard({ entry, compact = false }: MoodCardProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (compact) {
    return (
      <div className="wellness-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{entry.emoji}</span>
            <div>
              <p className="font-medium text-sm">{formatDate(entry.date)}</p>
              <p className="text-xs text-muted-foreground">{formatTime(entry.created_at)}</p>
            </div>
          </div>
        </div>
        {entry.note && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{entry.note}</p>
        )}
      </div>
    );
  }

  return (
    <Card className="wellness-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{entry.emoji}</span>
            <div>
              <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                at {formatTime(entry.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      {entry.note && (
        <CardContent>
          <p className="text-muted-foreground">{entry.note}</p>
        </CardContent>
      )}
    </Card>
  );
}