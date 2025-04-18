import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function RecentLeads() {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  
  const { data, isLoading, error } = useQuery<LeadsResponse>({
    queryKey: [`/api/leads?page=${page}&limit=4`],
  });
  
  const handleScheduleCall = (leadId: number) => {
    // In a full implementation, this would open a modal to schedule a call
    console.log("Schedule call for lead ID:", leadId);
  };
  
  const handleViewLead = (leadId: number) => {
    // In a full implementation, this would navigate to the lead details page
    console.log("View lead details for ID:", leadId);
  };
  
  const filteredLeads = data?.leads.filter(lead => {
    if (filter === "all") return true;
    return lead.status === filter;
  });

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary-100 text-primary-800";
      case "qualified":
        return "bg-success bg-opacity-10 text-success";
      case "in-progress":
        return "bg-secondary-100 text-secondary-800";
      case "contacted":
        return "bg-neutral-100 text-neutral-800";
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

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Leads</h2>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Leads</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error loading leads: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Leads</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value)}
          >
            <SelectTrigger className="h-9 pl-3 pr-8 py-1.5 text-sm bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 w-[120px]">
              <SelectValue placeholder="All Leads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
            </SelectContent>
          </Select>
          <button className="text-neutral-500 hover:text-neutral-700">
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Project Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredLeads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserAvatar 
                      name={lead.name} 
                      className="h-10 w-10"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">{lead.name}</div>
                      <div className="text-sm text-neutral-500">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{lead.projectType}</td>
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
                    <span className="text-sm font-medium text-neutral-700">{lead.score}</span>
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
                  <span className={`px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(lead.status)} rounded-full`}>
                    {formatStatusLabel(lead.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-primary-600 hover:text-primary-800 mr-3"
                    onClick={() => handleScheduleCall(lead.id)}
                  >
                    <i className="ri-calendar-line"></i>
                  </button>
                  <button 
                    className="text-neutral-600 hover:text-neutral-800"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    <i className="ri-more-2-fill"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 border-t border-neutral-200 flex items-center justify-between">
        <div className="text-sm text-neutral-500">
          Showing {filteredLeads?.length} of {data?.pagination.total} leads
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm"
          >
            Previous
          </Button>
          
          {[...Array(Math.min(data?.pagination.totalPages || 1, 3))].map((_, idx) => (
            <Button
              key={idx}
              variant={page === idx + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(idx + 1)}
              className="px-3 py-1 text-sm"
            >
              {idx + 1}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(data?.pagination.totalPages || 1, page + 1))}
            disabled={page === data?.pagination.totalPages}
            className="px-3 py-1 text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
