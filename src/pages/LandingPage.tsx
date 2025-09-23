import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Heart, Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const features = [
    {
      icon: Heart,
      title: "Mood Tracking",
      description: "Monitor your emotional wellness with intuitive mood logging and insights"
    },
    {
      icon: Brain,
      title: "AI Companion",
      description: "Get personalized support and guidance from your intelligent wellness companion"
    },
    {
      icon: Sparkles,
      title: "Mindful Journaling",
      description: "Express your thoughts and feelings in a safe, private digital space"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-wellness-calm to-primary-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MindIn</h1>
              <p className="text-sm text-muted-foreground">Your wellness companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Your mental wellness journey starts here
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Nurture your mind with{" "}
            <span className="text-primary">mindful journaling</span> and AI support
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your moods, reflect through journaling, and get personalized insights 
            from your AI companion. A safe space for your mental wellness journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-xl"
              >
                Start Your Journey
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-3 rounded-xl"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="wellness-card text-center">
                <CardHeader className="pb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-card rounded-2xl shadow-[var(--shadow-card)] border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to prioritize your mental wellness?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who are taking control of their mental health 
              with MindIn's gentle, supportive approach to self-care.
            </p>
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-xl"
              >
                Begin Today - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-1 bg-primary/10 rounded-lg">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 MindIn. Nurturing mental wellness.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}