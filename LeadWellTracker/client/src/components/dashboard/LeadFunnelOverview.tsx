import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// In a real implementation, we would use a proper chart library
// like Chart.js or Recharts for the lead source chart
export function LeadFunnelOverview() {
  const [period, setPeriod] = useState("week");

  // Funnel data - would come from API in real implementation
  const funnelData = [
    { stage: "New Leads", count: 24, total: 24, percentage: 100 },
    { stage: "Contacted", count: 20, total: 24, percentage: 83 },
    { stage: "Qualified", count: 18, total: 24, percentage: 75 },
    { stage: "Proposal Sent", count: 12, total: 24, percentage: 50 },
    { stage: "Won", count: 8, total: 24, percentage: 33 }
  ];

  // Lead source data
  const sourceData = [
    { source: "Facebook", count: 8, change: "+12%", icon: "ri-facebook-circle-fill", iconColor: "text-blue-600" },
    { source: "Google", count: 7, change: "+5%", icon: "ri-google-fill", iconColor: "text-red-500" },
    { source: "Website", count: 5, change: "-2%", icon: "ri-global-line", iconColor: "text-neutral-700" },
    { source: "Referrals", count: 4, change: "+24%", icon: "ri-contacts-line", iconColor: "text-primary-600" }
  ];

  return (
    <div className="px-6 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Lead Funnel</h2>
          <div className="flex items-center mt-2 sm:mt-0 space-x-3">
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="h-9 pl-3 pr-8 py-1.5 text-sm bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 w-[140px]">
                <SelectValue placeholder="This Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            <div className="lg:w-1/3 mb-6 lg:mb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-neutral-800 font-medium">Conversion by Stage</h3>
                <span className="text-xs text-neutral-500">24 total leads</span>
              </div>

              <div className="space-y-4">
                {funnelData.map((item) => (
                  <div key={item.stage}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">{item.stage}</span>
                      <span className="text-sm text-neutral-500">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          item.stage === "New Leads" ? "bg-primary-600" :
                          item.stage === "Contacted" ? "bg-secondary-500" :
                          item.stage === "Qualified" ? "bg-green-500" :
                          item.stage === "Proposal Sent" ? "bg-secondary-400" :
                          "bg-primary-500"
                        }`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-neutral-800 font-medium">Leads by Source</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                    <span className="text-xs text-neutral-500">This Week</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-neutral-300 rounded-full mr-2"></div>
                    <span className="text-xs text-neutral-500">Last Week</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {/* This would be a chart in a real implementation */}
                <div className="bg-neutral-50 rounded-lg border border-neutral-200 h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="ri-bar-chart-line text-4xl text-neutral-400 block mb-2"></i>
                    <span className="text-neutral-500 text-sm">Lead Source Chart</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sourceData.map((source) => (
                  <div key={source.source} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center">
                      <i className={`${source.icon} ${source.iconColor} text-xl mr-2`}></i>
                      <span className="text-sm font-medium">{source.source}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-semibold text-neutral-900">{source.count}</span>
                      <span className={`text-xs ml-2 ${source.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {source.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
