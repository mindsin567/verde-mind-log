import { useState } from "react";
import { MessageCircle, Send, Bot, User, Sparkles, Heart, Brain, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

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

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponseContent = await getAIResponse(content);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Error calling Gemini:', error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      }

      return data.response || "I'm sorry, I couldn't generate a response right now.";
    } catch (error) {
      console.error('Error in getAIResponse:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
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
                Powered by Gemini AI
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Your conversations are powered by Google's Gemini AI and saved to your account for continuity.
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
                <Badge variant="secondary" className="ml-auto">Gemini AI</Badge>
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