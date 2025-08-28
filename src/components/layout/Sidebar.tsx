import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Smile, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  User, 
  Settings,
  Menu,
  X,
  Leaf,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Main navigation items
const mainNavigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Mood Logs", href: "/mood", icon: Smile },
  { name: "Diary", href: "/diary", icon: BookOpen },
  { name: "AI Chat", href: "/chat", icon: MessageCircle },
  { name: "Summary", href: "/summary", icon: TrendingUp },
];

// Bottom navigation items
const bottomNavigation = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-border transition-all duration-300",
        isCollapsed ? "justify-center p-4" : "gap-3 p-6"
      )}>
        <div className="p-2 bg-primary/10 rounded-xl">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-foreground">MindIn</h1>
            <p className="text-sm text-muted-foreground">Your wellness companion</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-hidden">
        {mainNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "sidebar-item-active shadow-[var(--shadow-wellness)]"
                  : "sidebar-item text-muted-foreground",
                isCollapsed && "justify-center"
              )}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation - Profile & Settings */}
      <div className="p-4 space-y-2 border-t border-border">
        {bottomNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "sidebar-item-active shadow-[var(--shadow-wellness)]"
                  : "sidebar-item text-muted-foreground",
                isCollapsed && "justify-center"
              )}
              onClick={() => setIsMobileOpen(false)}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden lg:block p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full flex items-center gap-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Mindful Moment - Only when expanded */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="p-4 bg-wellness-calm rounded-xl">
            <p className="text-sm font-medium text-foreground">Take a mindful moment</p>
            <p className="text-xs text-muted-foreground mt-1">
              Remember to breathe and be present 🌱
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out lg:translate-x-0 h-screen flex-shrink-0",
          // Mobile states
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop collapsed states
          isCollapsed ? "lg:w-20" : "lg:w-72",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}