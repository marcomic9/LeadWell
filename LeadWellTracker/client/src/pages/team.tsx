import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock team members data (in a real app would come from API)
const teamMembers = [
  {
    id: 1,
    name: "Mike Henderson",
    role: "Sales Manager",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    email: "mike@leadwell.com",
    phone: "(555) 123-4567",
    status: "online",
    leads: 45,
    performance: 92,
    department: "Sales"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Sales Representative",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    email: "sarah@leadwell.com",
    phone: "(555) 234-5678",
    status: "online",
    leads: 32,
    performance: 88,
    department: "Sales"
  },
  {
    id: 3,
    name: "David Rodriguez",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    email: "david@leadwell.com",
    phone: "(555) 345-6789",
    status: "offline",
    leads: 28,
    performance: 85,
    department: "Project Management"
  },
  {
    id: 4,
    name: "Emily Chen",
    role: "Marketing Specialist",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    email: "emily@leadwell.com",
    phone: "(555) 456-7890",
    status: "online",
    leads: 19,
    performance: 79,
    department: "Marketing"
  },
  {
    id: 5,
    name: "James Wilson",
    role: "Sales Representative",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    email: "james@leadwell.com",
    phone: "(555) 567-8901",
    status: "away",
    leads: 27,
    performance: 83,
    department: "Sales"
  },
  {
    id: 6,
    name: "Lisa Park",
    role: "Customer Success",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    email: "lisa@leadwell.com",
    phone: "(555) 678-9012",
    status: "online",
    leads: 15,
    performance: 90,
    department: "Customer Success"
  }
];

export default function Team() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [newMemberFormOpen, setNewMemberFormOpen] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "offline": return "bg-neutral-300";
      case "away": return "bg-yellow-500";
      default: return "bg-neutral-300";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(teamMembers.map(member => member.department)));

  return (
    <Layout user={user}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Team</h1>
            <p className="mt-1 text-neutral-500">Manage your team members and their access</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Dialog open={newMemberFormOpen} onOpenChange={setNewMemberFormOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center">
                  <i className="ri-user-add-line mr-2"></i>
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new team member. They'll receive an invitation via email.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                    <Input id="name" className="col-span-3" placeholder="Full name" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="email" className="text-right text-sm font-medium">Email</label>
                    <Input id="email" className="col-span-3" placeholder="Email address" type="email" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="role" className="text-right text-sm font-medium">Role</label>
                    <Input id="role" className="col-span-3" placeholder="Job title" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="department" className="text-right text-sm font-medium">Department</label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Project Management">Project Management</SelectItem>
                        <SelectItem value="Customer Success">Customer Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="access" className="text-right text-sm font-medium">Access Level</label>
                    <Select defaultValue="member">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="member">Team Member</SelectItem>
                        <SelectItem value="readonly">Read Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewMemberFormOpen(false)}>Cancel</Button>
                  <Button type="submit" onClick={() => setNewMemberFormOpen(false)}>Send Invitation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
              <Input
                placeholder="Search team members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-neutral-400">
                <i className="ri-search-line"></i>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`p-2 ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'}`}
                onClick={() => setView('grid')}
              >
                <i className="ri-grid-fill"></i>
              </button>
              <button 
                className={`p-2 ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'hover:bg-neutral-50'}`}
                onClick={() => setView('list')}
              >
                <i className="ri-list-check"></i>
              </button>
            </div>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <Card key={member.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-primary-50 h-32 relative">
                    <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
                      <UserAvatar
                        src={member.avatar}
                        name={member.name}
                        className="h-20 w-20 border-4 border-white shadow-md"
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center bg-white/80 px-2 py-1 rounded-full backdrop-blur-sm text-xs font-medium">
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${getStatusColor(member.status)}`}></div>
                        {member.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-lg">{member.name}</h3>
                    <p className="text-neutral-500 text-sm">{member.role}</p>
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <Badge variant="outline" className="border-neutral-200">
                        {member.department}
                      </Badge>
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-neutral-600">Leads:</span>
                      <span className="font-medium">{member.leads}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-600">Performance:</span>
                      <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                        {member.performance}%
                      </span>
                    </div>
                  </div>
                  <div className="border-t p-3 bg-neutral-50 flex justify-between">
                    <button className="text-primary-600 hover:text-primary-800 p-1">
                      <i className="ri-mail-line"></i>
                    </button>
                    <button className="text-primary-600 hover:text-primary-800 p-1">
                      <i className="ri-phone-line"></i>
                    </button>
                    <button className="text-primary-600 hover:text-primary-800 p-1">
                      <i className="ri-message-2-line"></i>
                    </button>
                    <button className="text-neutral-600 hover:text-neutral-800 p-1">
                      <i className="ri-more-2-fill"></i>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white">
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserAvatar
                              src={member.avatar}
                              name={member.name}
                              className="h-10 w-10"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                              <div className="text-sm text-neutral-500">{member.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{member.email}</div>
                          <div className="text-sm text-neutral-500">{member.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="border-neutral-200">
                            {member.department}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-neutral-500">Leads:</span>
                              <span className="font-medium">{member.leads}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">Performance:</span>
                              <span className={`font-medium ${getPerformanceColor(member.performance)}`}>
                                {member.performance}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(member.status)}`}></div>
                            <span className="text-sm capitalize">{member.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="mr-1 text-neutral-600 hover:text-neutral-800">
                            <i className="ri-edit-line"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                            <i className="ri-delete-bin-line"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  No team members found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}