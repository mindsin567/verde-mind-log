import { useState } from "react";
import { MessageCircle, Send, Bot, User, Sparkles, Heart, Brain, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { text: "How can I improve my mood today?", icon: Heart },
  { text: "Tell me about mindfulness techniques", icon: Brain },
  { text: "I'm feeling stressed, can you help?", icon: Sparkles },
  { text: "Give me a wellness tip", icon: Lightbulb }
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content: "Hello! I'm your AI wellness companion. I'm here to support your mental health journey, provide mindfulness tips, and help you reflect on your emotions. How are you feeling today?",
    timestamp: new Date()
  }
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      return "I understand you're feeling stressed. Try this breathing exercise: Breathe in for 4 counts, hold for 4, breathe out for 6. Repeat 3 times. Remember, it's okay to feel this way, and this feeling will pass. Would you like me to guide you through a longer relaxation technique?";
    } 
    
    if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "That's wonderful to hear! I'm so glad you're feeling positive today. These good moments are precious - consider taking a moment to really savor this feeling. What specifically is making you feel good today?";
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('upset')) {
      return "I'm sorry you're going through a difficult time. Your feelings are valid, and it's important to acknowledge them. Sometimes talking helps - would you like to share more about what's troubling you? Or perhaps we could explore some gentle activities that might help lift your spirits?";
    }
    
    if (lowerMessage.includes('mindful') || lowerMessage.includes('meditation')) {
      return "Mindfulness is a powerful practice! Here's a simple technique: Find a comfortable position and focus on your breath. When thoughts arise, gently acknowledge them and return your attention to breathing. Even 5 minutes can make a difference. Would you like me to guide you through a specific mindfulness exercise?";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) {
      return "Good sleep is crucial for mental health. Try establishing a bedtime routine: dim lights 1 hour before bed, avoid screens, and consider gentle stretching or reading. Creating a cool, dark environment can also help. How has your sleep been lately?";
    }

    // Default response
    return "Thank you for sharing that with me. I'm here to listen and support you. Every step in your wellness journey matters, no matter how small. Is there anything specific you'd like to explore or discuss about your mental health today?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Wellness Chat</h1>
          <p className="text-muted-foreground">Your personal mental health companion</p>
        </div>
      </div>

      {/* Notice Card */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Connect Supabase for Full AI Chat
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                This is a demo version. Connect to Supabase to enable real AI conversations with Gemini API and save your chat history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex gap-4">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
                <Badge variant="secondary" className="ml-auto">Demo Mode</Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary/10">
                            <User className="h-4 w-4 text-secondary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Share your thoughts or ask for wellness advice..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={() => sendMessage(inputValue)}
                    disabled={isTyping || !inputValue.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => sendMessage(prompt.text)}
                  disabled={isTyping}
                >
                  <prompt.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{prompt.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wellness Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Daily Check-in</h4>
                <p className="text-xs text-muted-foreground">
                  Take a moment each day to assess how you're feeling
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Mindful Breathing</h4>
                <p className="text-xs text-muted-foreground">
                  Practice deep breathing for instant stress relief
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Gratitude Practice</h4>
                <p className="text-xs text-muted-foreground">
                  List three things you're grateful for each day
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}