import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  return (
    <Layout user={user}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
            <p className="mt-1 text-neutral-500">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Settings</h3>
                </div>
                <div className="p-2">
                  <div className="space-y-1">
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "profile" ? "bg-primary-100 text-primary-700" : "hover:bg-neutral-100"}`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <div className="flex items-center">
                        <i className="ri-user-3-line mr-2"></i>
                        <span>Profile</span>
                      </div>
                    </button>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "notifications" ? "bg-primary-100 text-primary-700" : "hover:bg-neutral-100"}`}
                      onClick={() => setActiveTab("notifications")}
                    >
                      <div className="flex items-center">
                        <i className="ri-notification-3-line mr-2"></i>
                        <span>Notifications</span>
                      </div>
                    </button>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "security" ? "bg-primary-100 text-primary-700" : "hover:bg-neutral-100"}`}
                      onClick={() => setActiveTab("security")}
                    >
                      <div className="flex items-center">
                        <i className="ri-shield-check-line mr-2"></i>
                        <span>Security</span>
                      </div>
                    </button>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "integrations" ? "bg-primary-100 text-primary-700" : "hover:bg-neutral-100"}`}
                      onClick={() => setActiveTab("integrations")}
                    >
                      <div className="flex items-center">
                        <i className="ri-link mr-2"></i>
                        <span>Integrations</span>
                      </div>
                    </button>
                    <button 
                      className={`w-full text-left px-3 py-2 rounded-md ${activeTab === "billing" ? "bg-primary-100 text-primary-700" : "hover:bg-neutral-100"}`}
                      onClick={() => setActiveTab("billing")}
                    >
                      <div className="flex items-center">
                        <i className="ri-bank-card-line mr-2"></i>
                        <span>Billing</span>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account profile information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                          <UserAvatar
                            src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                            name={user?.name || "Mike Henderson"}
                            className="w-20 h-20"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium">{user?.name}</h3>
                          <p className="text-sm text-neutral-500">{user?.email}</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="mr-2">
                              <i className="ri-upload-line mr-1"></i> Upload
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <i className="ri-delete-bin-line mr-1"></i> Remove
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Your name" 
                            defaultValue={user?.name || "Mike Henderson"} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Your email" 
                            defaultValue={user?.email || "mike@leadwell.com"} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            placeholder="Your phone" 
                            defaultValue={user?.phone || "(555) 123-4567"} 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="job">Job Title</Label>
                          <Input 
                            id="job" 
                            placeholder="Your job title" 
                            defaultValue={user?.jobTitle || "Sales Manager"} 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Tell us about yourself" 
                          defaultValue={user?.bio || "Sales professional with 10+ years of experience in the construction industry."} 
                          className="mt-1 h-24"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 border-t p-4 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Update your company details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input 
                            id="company" 
                            placeholder="Company name" 
                            defaultValue="BuildRight Construction" 
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input 
                            id="website" 
                            placeholder="Website URL" 
                            defaultValue="https://buildright.com" 
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Select defaultValue="construction">
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="construction">Construction</SelectItem>
                              <SelectItem value="real-estate">Real Estate</SelectItem>
                              <SelectItem value="architecture">Architecture</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="size">Company Size</Label>
                          <Select defaultValue="10-50">
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-9">1-9 employees</SelectItem>
                              <SelectItem value="10-50">10-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="501+">501+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea 
                          id="address" 
                          placeholder="Company address" 
                          defaultValue="123 Construction Ave, Building 4, Suite 300, San Francisco, CA 94107" 
                          className="mt-1 h-20"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 border-t p-4 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-leads" className="text-base">New Lead Alerts</Label>
                            <p className="text-sm text-neutral-500">Get notified when new leads are added</p>
                          </div>
                          <Switch id="email-leads" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-appointments" className="text-base">Appointment Reminders</Label>
                            <p className="text-sm text-neutral-500">Receive reminders before scheduled appointments</p>
                          </div>
                          <Switch id="email-appointments" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-ai" className="text-base">AI Insights</Label>
                            <p className="text-sm text-neutral-500">Get notified when AI generates new insights</p>
                          </div>
                          <Switch id="email-ai" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-updates" className="text-base">Product Updates</Label>
                            <p className="text-sm text-neutral-500">Learn about new features and improvements</p>
                          </div>
                          <Switch id="email-updates" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Browser Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="browser-leads" className="text-base">New Lead Alerts</Label>
                            <p className="text-sm text-neutral-500">Show desktop notification for new leads</p>
                          </div>
                          <Switch id="browser-leads" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="browser-appointments" className="text-base">Appointment Reminders</Label>
                            <p className="text-sm text-neutral-500">Show notification before appointments</p>
                          </div>
                          <Switch id="browser-appointments" defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t p-4 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Change Password</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" className="mt-1" />
                        </div>
                      </div>
                      <Button className="mt-4">Update Password</Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-3">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-500 mb-4">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-3">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-green-100 text-green-700 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                                <i className="ri-computer-line"></i>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Chrome on Windows</div>
                                <div className="text-xs text-neutral-500">San Francisco, CA · Current session</div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <i className="ri-logout-box-line mr-1"></i> Log out
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t p-4 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "integrations" && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Manage connected applications and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-500 text-white h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                            <i className="ri-openai-fill text-2xl"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">OpenAI</h3>
                            <p className="text-sm text-neutral-500">Connected · Last used 1 hour ago</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="mt-4 text-sm">
                        <p>Powers AI lead insights, sentiment analysis, and intent extraction.</p>
                      </div>
                      <div className="mt-3 flex">
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-neutral-200 text-neutral-700 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                            <i className="ri-google-fill text-2xl"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">Google Calendar</h3>
                            <p className="text-sm text-neutral-500">Not connected</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      <div className="mt-4 text-sm">
                        <p>Sync appointments with your Google Calendar.</p>
                      </div>
                      <div className="mt-3 flex">
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-neutral-200 text-neutral-700 h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                            <i className="ri-mail-line text-2xl"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">Email Integration</h3>
                            <p className="text-sm text-neutral-500">Not connected</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      <div className="mt-4 text-sm">
                        <p>Connect your email to automatically track conversations with leads.</p>
                      </div>
                      <div className="mt-3 flex">
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "billing" && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md bg-primary-50 border-primary-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Professional Plan</h3>
                          <p className="text-sm text-neutral-500">$49.99/month · Renews on May 15, 2025</p>
                        </div>
                        <Button variant="outline">Upgrade Plan</Button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-white rounded-md border">
                          <div className="text-2xl font-semibold">5,000</div>
                          <div className="text-sm text-neutral-500">Lead Capacity</div>
                        </div>
                        <div className="p-3 bg-white rounded-md border">
                          <div className="text-2xl font-semibold">10</div>
                          <div className="text-sm text-neutral-500">Team Members</div>
                        </div>
                        <div className="p-3 bg-white rounded-md border">
                          <div className="text-2xl font-semibold">100 GB</div>
                          <div className="text-sm text-neutral-500">Storage</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                      <div className="p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-neutral-100 h-10 w-16 rounded flex items-center justify-center mr-4">
                              <i className="ri-visa-line text-2xl"></i>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Visa ending in 4242</div>
                              <div className="text-xs text-neutral-500">Expires 12/2026</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3">
                        <i className="ri-add-line mr-1"></i> Add Payment Method
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Billing History</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Invoice
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                Apr 15, 2025
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                Professional Plan Subscription
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                $49.99
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Paid
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm">
                                  <i className="ri-download-line mr-1"></i> Download
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                Mar 15, 2025
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                Professional Plan Subscription
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                                $49.99
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Paid
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm">
                                  <i className="ri-download-line mr-1"></i> Download
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}