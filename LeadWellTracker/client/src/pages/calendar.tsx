import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { User, Call } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, isSameDay, parseISO } from "date-fns";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [newCallFormOpen, setNewCallFormOpen] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const { data: calls, isLoading } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
  });

  const formatTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const todayCalls = calls?.filter(call => {
    if (!date) return false;
    return isSameDay(parseISO(call.scheduledAt), date);
  }) || [];

  // Generate week days
  const weekDays = [];
  if (date) {
    // Start from current date and get the next 7 days
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(date, i));
    }
  }

  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(hour);
  }

  return (
    <Layout user={user}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Calendar</h1>
            <p className="mt-1 text-neutral-500">Schedule and manage your appointments</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Dialog open={newCallFormOpen} onOpenChange={setNewCallFormOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center">
                  <i className="ri-add-line mr-2"></i>
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Fill out the details below to schedule a new appointment with a lead.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right text-sm font-medium">Title</label>
                    <Input id="title" className="col-span-3" placeholder="Initial Consultation" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="lead" className="text-right text-sm font-medium">Lead</label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">James Donovan</SelectItem>
                        <SelectItem value="2">Sarah Miller</SelectItem>
                        <SelectItem value="3">Michael Chen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-right text-sm font-medium">Date</label>
                    <Input 
                      id="date" 
                      className="col-span-3" 
                      type="date" 
                      defaultValue={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="time" className="text-right text-sm font-medium">Time</label>
                    <Input 
                      id="time" 
                      className="col-span-3" 
                      type="time" 
                      defaultValue="09:00" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="duration" className="text-right text-sm font-medium">Duration</label>
                    <Select defaultValue="30">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="attendees" className="text-right text-sm font-medium">Attendees</label>
                    <Input id="attendees" className="col-span-3" placeholder="Add team members" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewCallFormOpen(false)}>Cancel</Button>
                  <Button type="submit" onClick={() => setNewCallFormOpen(false)}>Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium">Calendar</h3>
                </div>
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="p-4 border-t">
                  <h4 className="font-medium mb-3">Upcoming Appointments</h4>
                  <div className="space-y-3">
                    {isLoading ? (
                      [...Array(3)].map((_, index) => (
                        <div key={index} className="h-16 bg-neutral-100 animate-pulse rounded-md"></div>
                      ))
                    ) : calls && calls.length > 0 ? (
                      calls.slice(0, 3).map((call) => (
                        <div key={call.id} className="flex items-start bg-neutral-50 p-3 rounded-md border border-neutral-200">
                          <div className="bg-primary-100 text-primary-700 h-10 w-10 rounded-md flex items-center justify-center mr-3">
                            <i className="ri-calendar-line"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{call.title || "Call with " + call.lead.name}</div>
                            <div className="text-xs text-neutral-500">
                              {format(parseISO(call.scheduledAt), "MMM d, h:mm a")} · {call.duration} mins
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-neutral-500">
                        <i className="ri-calendar-line text-4xl mb-2"></i>
                        <p>No upcoming appointments</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {date && format(date, "MMMM d, yyyy")}
                  </h3>
                  <div className="flex space-x-2">
                    <Tabs defaultValue="week" className="w-[200px]" onValueChange={(v) => setView(v as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                {view === "day" && (
                  <div className="p-4">
                    <div className="min-h-[600px]">
                      <div className="border-b pb-4 mb-4">
                        <h3 className="font-medium text-lg">
                          {date && format(date, "EEEE, MMMM d")}
                        </h3>
                      </div>

                      {timeSlots.map((hour) => {
                        const hourCalls = todayCalls.filter(call => {
                          const callHour = parseISO(call.scheduledAt).getHours();
                          return callHour === hour;
                        });

                        return (
                          <div 
                            key={hour} 
                            className="grid grid-cols-12 py-3 border-b border-neutral-100 group hover:bg-neutral-50"
                          >
                            <div className="col-span-2 text-neutral-500 text-sm">
                              {format(new Date().setHours(hour, 0, 0), "h:mm a")}
                            </div>
                            <div className="col-span-10">
                              {hourCalls.length > 0 ? (
                                hourCalls.map(call => (
                                  <div 
                                    key={call.id} 
                                    className="bg-primary-100 border-l-4 border-primary-500 p-2 rounded-r-md mb-2"
                                  >
                                    <div className="text-sm font-medium">{call.title || "Call with " + call.lead.name}</div>
                                    <div className="text-xs flex justify-between text-neutral-500">
                                      <span>{formatTimeDisplay(call.scheduledAt)} · {call.duration} mins</span>
                                      <div className="flex space-x-2">
                                        <button className="text-neutral-500 hover:text-neutral-700">
                                          <i className="ri-edit-line"></i>
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                          <i className="ri-delete-bin-line"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="h-6 group-hover:bg-primary-50 group-hover:border-dashed group-hover:border group-hover:border-primary-200 rounded-md group-hover:flex items-center justify-center hidden">
                                  <button 
                                    className="text-xs text-primary-600 hover:text-primary-800"
                                    onClick={() => setNewCallFormOpen(true)}
                                  >
                                    + Add appointment
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "week" && (
                  <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                      <div className="grid grid-cols-8 border-b">
                        <div className="p-3 text-neutral-500 font-medium text-sm">Time</div>
                        {weekDays.map((day, index) => (
                          <div 
                            key={index}
                            className={`p-3 font-medium text-center border-l ${
                              isSameDay(day, new Date()) ? "bg-primary-50" : ""
                            }`}
                          >
                            <div>{format(day, "EEE")}</div>
                            <div className={`text-lg ${
                              isSameDay(day, new Date()) ? "text-primary-600" : ""
                            }`}>
                              {format(day, "d")}
                            </div>
                          </div>
                        ))}
                      </div>

                      {timeSlots.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b">
                          <div className="p-3 text-neutral-500 text-sm border-r">
                            {format(new Date().setHours(hour, 0, 0), "h:mm a")}
                          </div>
                          {weekDays.map((day, dayIndex) => (
                            <div 
                              key={dayIndex} 
                              className={`border-l p-1 min-h-[70px] hover:bg-neutral-50 ${
                                isSameDay(day, new Date()) ? "bg-primary-50/30" : ""
                              }`}
                            >
                              {/* This would display appointments in week view */}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {view === "month" && (
                  <div className="p-4 text-center text-neutral-500 min-h-[600px] flex items-center justify-center">
                    <div>
                      <i className="ri-calendar-line text-4xl mb-2"></i>
                      <p>Month view would be implemented here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}