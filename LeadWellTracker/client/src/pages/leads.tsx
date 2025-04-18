import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { User, Lead } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: [`/api/leads?page=${page}&limit=${limit}`],
  });

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary-100 text-primary-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredLeads = data?.leads.filter(lead => {
    const matchesSearch = 
      searchQuery === "" || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout user={user}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Leads</h1>
            <p className="mt-1 text-neutral-500">Manage and track your potential clients</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center">
                  <i className="ri-add-line mr-2"></i>
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new lead. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                    <Input id="name" className="col-span-3" placeholder="John Smith" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="email" className="text-right text-sm font-medium">Email</label>
                    <Input id="email" className="col-span-3" placeholder="john@example.com" type="email" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="phone" className="text-right text-sm font-medium">Phone</label>
                    <Input id="phone" className="col-span-3" placeholder="(123) 456-7890" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="project" className="text-right text-sm font-medium">Project Type</label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="source" className="text-right text-sm font-medium">Source</label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Lead</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-sm">
                <Input
                  placeholder="Search leads..."
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
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <i className="ri-filter-3-line mr-1"></i> More Filters
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Project Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Score
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
                {isLoading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-12 bg-neutral-100 rounded-md animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLeads && filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserAvatar 
                            name={lead.name} 
                            className="h-10 w-10"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">{lead.name}</div>
                            <div className="text-xs text-neutral-500">Added {new Date(lead.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-800">{lead.email}</div>
                        <div className="text-xs text-neutral-500">{lead.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {lead.projectType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-neutral-700">
                          <i className={`${lead.sourceIcon} mr-2 ${
                            lead.source === "Facebook" ? "text-blue-600" :
                            lead.source === "Google" ? "text-red-500" :
                            lead.source === "LinkedIn" ? "text-blue-700" :
                            "text-neutral-700"
                          }`}></i>
                          {lead.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`font-medium text-xs px-2 py-1 rounded-full ${
                            lead.score >= 80 ? "bg-green-100 text-green-800" : 
                            lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"
                          }`}>
                            {lead.score}
                          </span>
                          <div className="w-16 h-2 bg-neutral-200 rounded-full ml-2">
                            <div 
                              className={`h-2 rounded-full ${
                                lead.score >= 80 ? "bg-green-500" :
                                lead.score >= 60 ? "bg-yellow-500" :
                                "bg-red-500"
                              }`} 
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeClasses(lead.status)}>
                          {formatStatusLabel(lead.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-primary-600 hover:text-primary-800" title="Schedule Call">
                            <i className="ri-calendar-line"></i>
                          </button>
                          <button className="text-blue-600 hover:text-blue-800" title="Edit Lead">
                            <i className="ri-edit-line"></i>
                          </button>
                          <button className="text-neutral-600 hover:text-neutral-800" title="More Options">
                            <i className="ri-more-2-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                      <div className="inline-flex mx-auto items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
                        <i className="ri-search-line text-2xl text-neutral-400"></i>
                      </div>
                      <p>No leads found matching your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-neutral-500">
              Showing {filteredLeads?.length || 0} of {data?.pagination.total || 0} leads
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!data || page === 1}
              >
                Previous
              </Button>
              
              {data?.pagination.totalPages && [...Array(Math.min(data.pagination.totalPages, 5))].map((_, idx) => (
                <Button
                  key={idx}
                  variant={page === idx + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(idx + 1)}
                >
                  {idx + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => data && setPage(Math.min(data.pagination.totalPages, page + 1))}
                disabled={!data || page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}