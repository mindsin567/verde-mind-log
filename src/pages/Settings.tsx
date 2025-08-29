import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Palette, Globe, Download, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SettingsState {
  theme: string;
  notifications: {
    dailyReminder: boolean;
    weeklyReport: boolean;
    moodStreaks: boolean;
    emailUpdates: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    publicProfile: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

const initialSettings: SettingsState = {
  theme: "system",
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    moodStreaks: true,
    emailUpdates: false
  },
  privacy: {
    dataSharing: false,
    analytics: true,
    publicProfile: false
  },
  preferences: {
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY"
  }
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);

  const updateNotificationSetting = (key: keyof SettingsState['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updatePrivacySetting = (key: keyof SettingsState['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  const updatePreferenceSetting = (key: keyof SettingsState['preferences'], value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.preferences.language} onValueChange={(value) => updatePreferenceSetting('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={settings.preferences.dateFormat} onValueChange={(value) => updatePreferenceSetting('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Mood Reminder</Label>
                <p className="text-sm text-muted-foreground">Get reminded to log your daily mood</p>
              </div>
              <Switch 
                checked={settings.notifications.dailyReminder} 
                onCheckedChange={(value) => updateNotificationSetting('dailyReminder', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly wellness summaries</p>
              </div>
              <Switch 
                checked={settings.notifications.weeklyReport} 
                onCheckedChange={(value) => updateNotificationSetting('weeklyReport', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Mood Streak Alerts</Label>
                <p className="text-sm text-muted-foreground">Celebrate your logging streaks</p>
              </div>
              <Switch 
                checked={settings.notifications.moodStreaks} 
                onCheckedChange={(value) => updateNotificationSetting('moodStreaks', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Updates</Label>
                <p className="text-sm text-muted-foreground">App updates and feature announcements</p>
              </div>
              <Switch 
                checked={settings.notifications.emailUpdates} 
                onCheckedChange={(value) => updateNotificationSetting('emailUpdates', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
              </div>
              <Switch 
                checked={settings.privacy.dataSharing} 
                onCheckedChange={(value) => updatePrivacySetting('dataSharing', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">Help us improve the app experience</p>
              </div>
              <Switch 
                checked={settings.privacy.analytics} 
                onCheckedChange={(value) => updatePrivacySetting('analytics', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch 
                checked={settings.privacy.publicProfile} 
                onCheckedChange={(value) => updatePrivacySetting('publicProfile', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Globe className="h-4 w-4 mr-2" />
              View Privacy Policy
            </Button>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your mood logs, diary entries, and account data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1">
            Change Password
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign Out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>MindIn Wellness App</span>
            <Badge variant="outline">v1.0.0</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}