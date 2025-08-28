import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MoodEntry {
  id: string;
  emoji: string;
  mood: string;
  note?: string;
  timestamp: Date;
  intensity: number; // 1-5 scale
}

interface MoodCardProps {
  entry: MoodEntry;
  compact?: boolean;
}

export function MoodCard({ entry, compact = false }: MoodCardProps) {
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 4) return "bg-success";
    if (intensity >= 3) return "bg-warning";
    return "bg-destructive";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (compact) {
    return (
      <div className="wellness-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{entry.emoji}</span>
            <div>
              <p className="font-medium text-sm">{entry.mood}</p>
              <p className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</p>
            </div>
          </div>
          <Badge 
            className={`${getIntensityColor(entry.intensity)} text-white text-xs`}
            variant="secondary"
          >
            {entry.intensity}/5
          </Badge>
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
              <CardTitle className="text-lg">{entry.mood}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {entry.timestamp.toLocaleDateString()} at {formatTime(entry.timestamp)}
              </p>
            </div>
          </div>
          <Badge 
            className={`${getIntensityColor(entry.intensity)} text-white`}
            variant="secondary"
          >
            Intensity {entry.intensity}/5
          </Badge>
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