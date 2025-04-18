import { StatsOverview } from "./StatsOverview";
import { RecentLeads } from "./RecentLeads";
import { UpcomingCalls } from "./UpcomingCalls";
import { AIInsights } from "./AIInsights";
import { LeadFunnelOverview } from "./LeadFunnelOverview";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function Dashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const currentTime = new Date();
  const hour = currentTime.getHours();
  
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  return (
    <div className="pb-12">
      {/* Dashboard Header with Gradient Background */}
      <div className="bg-gradient-to-r from-primary-50 via-white to-primary-50 border-b border-neutral-200 mb-6">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <UserAvatar
                src={user?.avatar}
                name={user?.name || "Mike Henderson"}
                className="w-12 h-12 mr-4 hidden sm:block"
              />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {greeting}, <span className="bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || "Mike"}</span>
                </h1>
                <p className="mt-1 text-neutral-600">Here's what's happening with your leads today</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline"
                className="flex items-center justify-center shadow-sm"
              >
                <i className="ri-download-line mr-2"></i>
                Export Report
              </Button>
              <Button className="flex items-center justify-center shadow-sm">
                <i className="ri-add-line mr-2"></i>
                New Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Overview */}
        <StatsOverview />

        {/* Main Content Grid */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Leads */}
          <RecentLeads />

          {/* Upcoming Calendar and AI Insights */}
          <div className="space-y-6">
            <UpcomingCalls />
            <AIInsights />
          </div>
        </div>

        {/* Lead Funnel Overview */}
        <LeadFunnelOverview />
      </div>
    </div>
  );
}
