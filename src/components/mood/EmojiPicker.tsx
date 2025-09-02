import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const moodEmojis = [
  { emoji: "😊", mood: "Happy", intensity: 5 },
  { emoji: "😄", mood: "Excited", intensity: 5 },
  { emoji: "😌", mood: "Peaceful", intensity: 4 },
  { emoji: "🙂", mood: "Content", intensity: 4 },
  { emoji: "😐", mood: "Neutral", intensity: 3 },
  { emoji: "🤔", mood: "Thoughtful", intensity: 3 },
  { emoji: "😔", mood: "Sad", intensity: 2 },
  { emoji: "😟", mood: "Worried", intensity: 2 },
  { emoji: "😢", mood: "Upset", intensity: 1 },
  { emoji: "😴", mood: "Tired", intensity: 2 },
  { emoji: "😤", mood: "Frustrated", intensity: 2 },
  { emoji: "🥰", mood: "Loved", intensity: 5 },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

export function EmojiPicker({ onSelect, selectedEmoji }: EmojiPickerProps) {
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">How are you feeling?</h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {moodEmojis.map((item) => (
          <Button
            key={item.emoji}
            variant="ghost"
            className={cn(
              "h-16 w-16 p-0 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center",
              selectedEmoji === item.emoji 
                ? "bg-primary/20 border-2 border-primary shadow-[var(--shadow-wellness)]" 
                : "hover:bg-accent border-2 border-transparent",
              "mood-emoji"
            )}
            onClick={() => onSelect(item.emoji)}
            onMouseEnter={() => setHoveredEmoji(item.emoji)}
            onMouseLeave={() => setHoveredEmoji(null)}
          >
            <span className="text-2xl">{item.emoji}</span>
            {(hoveredEmoji === item.emoji || selectedEmoji === item.emoji) && (
              <span className="text-xs font-medium text-center mt-1 leading-tight">
                {item.mood}
              </span>
            )}
          </Button>
        ))}
      </div>
      
      {selectedEmoji && (
        <div className="mt-4 p-4 bg-wellness-calm rounded-xl">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">
              {moodEmojis.find(m => m.emoji === selectedEmoji)?.mood}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}