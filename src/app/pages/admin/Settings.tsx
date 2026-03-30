import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [general, setGeneral] = useState({
    platformName: "MentorMe",
    contactEmail: "support@mentorme.com",
  });

  const [matching, setMatching] = useState({
    aiMatchingEnabled: true,
    weightSkills: 40,
    weightGoals: 35,
    weightAvailability: 25,
  });

  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: false,
  });

  const [security, setSecurity] = useState({
    sessionTimeoutMinutes: 30,
    twoFactorRequired: false,
  });

  const handleSave = () => {
    toast.success("Platform settings saved successfully.");
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
        <p className="text-gray-600">Configure platform-wide options and preferences</p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* General */}
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">General</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={general.platformName}
                onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
                placeholder="MentorMe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={general.contactEmail}
                onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
                placeholder="support@mentorme.com"
              />
            </div>
          </div>
        </Card>

        {/* Matching Settings */}
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Matching Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">AI Matching</p>
                <p className="text-sm text-gray-600">Use AI to suggest mentor-mentee pairs</p>
              </div>
              <Switch
                checked={matching.aiMatchingEnabled}
                onCheckedChange={(checked) =>
                  setMatching({ ...matching, aiMatchingEnabled: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Matching Criteria Weights (%)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weightSkills" className="text-sm text-gray-600">
                    Skills match
                  </Label>
                  <Input
                    id="weightSkills"
                    type="number"
                    min={0}
                    max={100}
                    value={matching.weightSkills}
                    onChange={(e) =>
                      setMatching({ ...matching, weightSkills: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightGoals" className="text-sm text-gray-600">
                    Goals match
                  </Label>
                  <Input
                    id="weightGoals"
                    type="number"
                    min={0}
                    max={100}
                    value={matching.weightGoals}
                    onChange={(e) =>
                      setMatching({ ...matching, weightGoals: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightAvailability" className="text-sm text-gray-600">
                    Availability
                  </Label>
                  <Input
                    id="weightAvailability"
                    type="number"
                    min={0}
                    max={100}
                    value={matching.weightAvailability}
                    onChange={(e) =>
                      setMatching({ ...matching, weightAvailability: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Send platform notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailEnabled}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Send reminders and alerts via SMS</p>
              </div>
              <Switch
                checked={notifications.smsEnabled}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, smsEnabled: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 border-0 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min={5}
                max={120}
                value={security.sessionTimeoutMinutes}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    sessionTimeoutMinutes: Number(e.target.value) || 30,
                  })
                }
              />
              <p className="text-sm text-gray-600">Auto-logout after this many minutes of inactivity</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Require 2FA</p>
                <p className="text-sm text-gray-600">Require two-factor authentication for all users</p>
              </div>
              <Switch
                checked={security.twoFactorRequired}
                onCheckedChange={(checked) =>
                  setSecurity({ ...security, twoFactorRequired: checked })
                }
              />
            </div>
          </div>
        </Card>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleSave}
        >
          <Save size={18} className="mr-2" />
          Save All Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
