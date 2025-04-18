import { useQuery } from "@tanstack/react-query";
import { format, isToday, differenceInMinutes, differenceInHours, isFuture } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";

interface Call {
  id: number;
  scheduledAt: string;
  duration: number;
  title: string;
  attendees: { id: number; name: string; role: string }[];
  lead: {
    id: number;
    name: string;
    projectType: string;
  };
}

export function UpcomingCalls() {
  const { data: calls, isLoading, error } = useQuery<Call[]>({
    queryKey: ["/api/calls?upcoming=true"],
  });

  const getTimeStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (isToday(date)) {
      const minutesDiff = differenceInMinutes(date, now);
      
      if (minutesDiff < 0) return { label: "Past", color: "text-neutral-400 bg-neutral-100" };
      if (minutesDiff < 15) return { label: `In ${minutesDiff} min`, color: "text-red-600 bg-red-100" };
      if (minutesDiff < 60) return { label: `In ${minutesDiff} min`, color: "text-amber-600 bg-amber-100" };
      return { label: `In ${differenceInHours(date, now)} hours`, color: "text-blue-600 bg-blue-100" };
    }
    
    return { label: format(date, "MMM d"), color: "text-neutral-600 bg-neutral-100" };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Upcoming Calls</h2>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Upcoming Calls</h2>
        </div>
        <div className="p-4">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error loading calls: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // Sort calls by time - upcoming first
  const sortedCalls = calls?.slice().sort((a, b) => {
    const dateA = new Date(a.scheduledAt);
    const dateB = new Date(b.scheduledAt);
    
    // If both are in future or both are in past, sort by time
    if ((isFuture(dateA) && isFuture(dateB)) || (!isFuture(dateA) && !isFuture(dateB))) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Otherwise, future calls come first
    return isFuture(dateA) ? -1 : 1;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md mr-3">
            <i className="ri-calendar-check-line text-blue-600"></i>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">Upcoming Calls</h2>
        </div>
        <Link href="/calendar" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center">
          View Calendar
          <i className="ri-arrow-right-s-line ml-1"></i>
        </Link>
      </div>
      
      <div className="p-4 space-y-4">
        {sortedCalls && sortedCalls.length > 0 ? (
          <>
            {sortedCalls.map((call) => {
              const timeStatus = getTimeStatus(call.scheduledAt);
              const isPast = new Date(call.scheduledAt) < new Date();
              
              return (
                <div 
                  key={call.id} 
                  className={`p-4 rounded-lg border ${isPast ? 'bg-neutral-50 border-neutral-200 opacity-75' : 'bg-white border-neutral-200 hover:border-primary-300'} transition-all hover:shadow-sm group`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <UserAvatar
                        name={call.lead.name}
                        className="h-10 w-10"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <h4 className="text-sm font-semibold text-neutral-900 truncate pr-2">
                          {call.title || `Call with ${call.lead.name}`}
                        </h4>
                        <Badge variant="outline" className={`whitespace-nowrap max-w-fit ${timeStatus.color} border-none mt-1 sm:mt-0`}>
                          {timeStatus.label}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-xs text-neutral-500">
                        <div className="flex items-center">
                          <i className="ri-calendar-line mr-1.5"></i>
                          <span>{format(new Date(call.scheduledAt), "EEE, MMM d")} </span>
                          <span className="mx-1.5">•</span>
                          <i className="ri-time-line mr-1.5"></i>
                          <span>{format(new Date(call.scheduledAt), "h:mm a")}</span>
                        </div>
                        <div className="sm:ml-auto mt-1 sm:mt-0 flex items-center">
                          <i className="ri-team-line mr-1.5"></i>
                          <span className="truncate">
                            {call.attendees.length > 0 
                              ? (call.attendees.length > 2 
                                  ? `${call.attendees[0].name} +${call.attendees.length - 1} more`
                                  : call.attendees.map(a => a.name).join(", ")
                                )
                              : "No attendees"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="flex items-center text-neutral-500">
                      <i className="ri-building-line mr-1.5"></i>
                      <span>{call.lead.projectType || "General"}</span>
                      <span className="mx-1.5">•</span>
                      <i className="ri-time-line mr-1.5"></i>
                      <span>{call.duration} min</span>
                    </div>
                    <div className="flex space-x-3">
                      <button className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className={`p-1 ${isPast ? 'text-neutral-400' : 'text-blue-500 hover:text-blue-700'} transition-colors`}>
                        <i className="ri-vidicon-line"></i>
                      </button>
                      <button className={`p-1 ${isPast ? 'text-neutral-400' : 'text-green-500 hover:text-green-700'} transition-colors`}>
                        <i className="ri-phone-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <Link href="/calendar" className="block">
              <Button variant="outline" className="w-full text-sm flex items-center justify-center">
                <i className="ri-calendar-line mr-2"></i>
                View All Appointments
              </Button>
            </Link>
          </>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-calendar-line text-3xl text-neutral-400"></i>
            </div>
            <p className="text-neutral-500 font-medium">No upcoming appointments</p>
            <p className="text-neutral-400 text-sm mt-1 mb-6">Your schedule is clear for now</p>
            
            <Link href="/calendar">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                <i className="ri-add-line mr-2"></i>
                Schedule a Call
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
