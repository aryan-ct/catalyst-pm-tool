import { useState, useEffect } from 'react';
import AllocationDetails from './AllocationDetails';
import { useResourceAllocation } from '../ResourceAllocationContext';
import { RESOURCE_ALLOCATIONS_API } from '@/api/resource-allocations.api';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Users,
  ArrowRight,
  Activity,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const AllocationSheets = ({
  onSelectDate,
}: {
  onSelectDate: (date: string) => void;
}) => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR';
  const today = new Date().toDateString();
  const { allocations, resources, projects } = useResourceAllocation();

  const uniqueDates = [...new Set(allocations.map((a) => a.date))];

  const [pageHR, setPageHR] = useState(1);
  const [pageMy, setPageMy] = useState(1);
  const [pageSizeHR, setPageSizeHR] = useState(7);
  const [pageSizeMy, setPageSizeMy] = useState(7);

  // Local state for paginated data
  const [pastAllocationsHR, setPastAllocationsHR] = useState<{ date: string; count: number }[]>([]);
  const [totalHR, setTotalHR] = useState(0);
  const [loadingHR, setLoadingHR] = useState(false);

  const [pastAllocationsMy, setPastAllocationsMy] = useState<any[]>([]);
  const [totalMy, setTotalMy] = useState(0);
  const [loadingMy, setLoadingMy] = useState(false);

  const hasToday = uniqueDates.includes(today);
  const sortedDates = uniqueDates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const first3Dates = sortedDates.slice(0, hasToday ? 3 : 2);

  // Group raw allocations by date for a single employee
  const groupMyAllocationsByDate = (rawData: any[]) => {
    const map = new Map<string, any>();
    
    rawData.forEach((ra: any) => {
      const dateStr = new Date(ra.createdAt).toDateString();
      let row = map.get(dateStr);
      if (!row) {
        row = {
          resourceId: ra.resourceId,
          resourceName: ra.resourceName || resources.find(r => r.id === ra.resourceId)?.name || 'Unknown',
          date: dateStr,
          projects: []
        };
        map.set(dateStr, row);
      }
      
      if (!ra.projectId) {
        if (ra.desc === 'Generate Leads' || (ra.desc && ra.desc.startsWith('Generate Leads::'))) {
          row.projects.push({
            id: ra.id,
            name: 'Generate Leads',
            description: ra.desc.startsWith('Generate Leads::') ? ra.desc.substring('Generate Leads::'.length) : '',
            isNote: false,
          });
        } else {
          row.projects.push({
            id: ra.id,
            name: ra.desc || '',
            description: '',
            isNote: true,
          });
        }
      } else {
        const project = projects.find(p => p.id === ra.projectId);
        row.projects.push({
          id: ra.projectId,
          name: project ? project.name : 'Unknown Project',
          description: ra.desc || '',
          isNote: false,
        });
      }
    });

    return Array.from(map.values());
  };

  // Group raw allocations by date for HR view
  const groupHRAllocationsByDate = (rawData: any[]) => {
    const map = new Map<string, Set<string>>();
    rawData.forEach((ra: any) => {
      const dateStr = new Date(ra.createdAt).toDateString();
      if (!map.has(dateStr)) {
        map.set(dateStr, new Set<string>());
      }
      map.get(dateStr)!.add(ra.resourceId);
    });
    
    return Array.from(map.entries()).map(([dateStr, resourceSet]) => ({
      date: dateStr,
      count: resourceSet.size
    }));
  };

  // Fetch ALL allocations for employee to do client-side grouped pagination
  const fetchMyPastAllocations = async () => {
    if (!user?.id) return;
    setLoadingMy(true);
    try {
      const response = await RESOURCE_ALLOCATIONS_API.getMyAllocations();
      const rawData = response.data || response || [];
      
      // Filter out today's allocation from rawData if we show todayAllocation separately
      const pastRawData = rawData.filter((ra: any) => new Date(ra.createdAt).toDateString() !== today);
      const grouped = groupMyAllocationsByDate(pastRawData);
      
      setPastAllocationsMy(grouped);
      setTotalMy(grouped.length);
    } catch (err) {
      console.error('Failed to fetch past allocations for employee:', err);
    } finally {
      setLoadingMy(false);
    }
  };

  // Fetch ALL allocations for HR to do client-side grouped pagination
  const fetchHRPastAllocations = async () => {
    setLoadingHR(true);
    try {
      const params: any = {};

      if (first3Dates.length > 0) {
        const oldestCardDate = first3Dates[first3Dates.length - 1];
        const oldestDate = new Date(oldestCardDate);
        oldestDate.setHours(0, 0, 0, 0); // Exclude the oldest card's day and newer
        params.end_date = oldestDate.toISOString();
      }

      const response = await RESOURCE_ALLOCATIONS_API.getAllResourceAllocations(params);
      const rawData = response.data || response || [];
      
      const grouped = groupHRAllocationsByDate(rawData);
      setPastAllocationsHR(grouped);
      setTotalHR(grouped.length);
    } catch (err) {
      console.error('Failed to fetch past allocations for HR:', err);
    } finally {
      setLoadingHR(false);
    }
  };

  // Sync / Fetch hooks
  useEffect(() => {
    if (!isHR) {
      fetchMyPastAllocations();
    }
  }, [user?.id, isHR, allocations]);

  useEffect(() => {
    if (isHR) {
      fetchHRPastAllocations();
    }
  }, [isHR, allocations]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pickerDate, setPickerDate] = useState<Date | undefined>();

  if (selectedDate) {
    return (
      <AllocationDetails
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
      />
    );
  }

  if (!isHR) {
    const myAllocations = allocations.filter((a) => a.resourceId === user?.id);
    const todayAllocation = myAllocations.find((a) => a.date === today);

    const totalPagesMy = Math.ceil(totalMy / pageSizeMy);

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground leading-tight">
            My Allocations
          </h3>
          <p className="text-sm text-muted-foreground">
            View your assigned tasks and projects.
          </p>
        </div>

        {/* Today's Segment Highlighted */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            Today
          </h4>
          {todayAllocation ? (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03]">
                <CalendarIcon className="h-40 w-40 text-primary" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {format(new Date(today), 'EEEE, MMMM d')}
                  </span>
                </div>

                <div className="space-y-3">
                  {todayAllocation.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-border/60 shadow-sm"
                    >
                      <p className="text-base font-bold text-foreground mb-1">
                        {proj.name}
                      </p>
                      {proj.description && (
                        <p className="text-sm text-muted-foreground">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 text-center">
              <p className="text-foreground font-semibold">
                No allocations for today
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later or contact your manager.
              </p>
            </div>
          )}
        </div>

        {/* Older Allocations */}
        {pastAllocationsMy.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              Previous Allocations
            </h4>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col relative">
              <div className="grid grid-cols-12 bg-muted/40 px-4 py-3 border-b border-border shrink-0">
                <div className="col-span-4 sm:col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date
                </div>
                <div className="hidden sm:block sm:col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Day
                </div>
                <div className="col-span-8 sm:col-span-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Assigned Tasks
                </div>
              </div>

              <div className="max-h-[290px] overflow-y-auto divide-y divide-border/60 relative min-h-[150px]">
                {loadingMy && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                    <Activity className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}
                {pastAllocationsMy.slice((pageMy - 1) * pageSizeMy, pageMy * pageSizeMy).map((alloc) => (
                  <div
                    key={alloc.date}
                    className="grid grid-cols-12 px-4 py-3.5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="col-span-4 sm:col-span-3 text-sm font-semibold text-foreground self-center">
                      {format(new Date(alloc.date), 'MMM d, yyyy')}
                    </div>
                    <div className="hidden sm:block sm:col-span-3 text-sm text-muted-foreground self-center">
                      {getDayOfWeek(alloc.date)}
                    </div>
                    <div className="col-span-8 sm:col-span-6 flex flex-col gap-2">
                      {alloc.projects.map((proj, i) => (
                        <div
                          key={i}
                          className="flex flex-col bg-muted/40 px-3 py-2 rounded-lg border border-border/40"
                        >
                          <span className="text-sm font-medium">
                            {proj.name}
                          </span>
                          {proj.description && (
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {proj.description}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {totalMy > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/20">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <span className="text-xs text-muted-foreground">
                      Showing {Math.min((pageMy - 1) * pageSizeMy + 1, totalMy)} to{' '}
                      {Math.min(
                        pageMy * pageSizeMy,
                        totalMy,
                      )}{' '}
                      of {totalMy} entries
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">Rows per page:</span>
                      <select
                        value={pageSizeMy}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setPageSizeMy(val);
                          setPageMy(1);
                        }}
                        className="bg-card border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm hover:bg-muted/10 transition-colors"
                      >
                        {[5, 7, 10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageMy((p) => Math.max(1, p - 1))}
                      disabled={pageMy === 1 || loadingMy}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageMy((p) => Math.min(totalPagesMy, p + 1))
                      }
                      disabled={pageMy === totalPagesMy || totalPagesMy <= 1 || loadingMy}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Activity className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground leading-tight">
              Recent Activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a date to view or manage resource allocations.
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger className="inline-flex w-full sm:w-64 items-center justify-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm font-normal shadow-sm transition-all hover:bg-accent">
            <CalendarIcon className="h-4 w-4 text-primary" />
            {pickerDate ? format(pickerDate, 'PPP') : 'View historical data'}
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0 border-border shadow-xl">
            <Calendar
              mode="single"
              selected={pickerDate}
              onSelect={(date) => {
                setPickerDate(date);
                if (date) {
                  onSelectDate(date.toDateString());
                }
              }}
              disabled={(date) =>
                date > new Date() || !uniqueDates.includes(date.toDateString())
              }
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!hasToday && (
          <div
            onClick={() => onSelectDate(today)}
            className="group relative p-5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
          >
            <span className="absolute top-3 right-3 bg-white/25 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
              Today
            </span>

            <div className="flex flex-col gap-4">
              {/* Day of week & Date */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {getDayOfWeek(today)}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black leading-none tracking-tight">
                    {getDayNum(today)}
                  </span>
                  <span className="text-sm font-semibold mb-1 text-white/70">
                    {getMonthYear(today)}
                  </span>
                </div>
              </div>

              {/* Empty State Message */}
              <div className="bg-white/10 rounded-lg p-2.5 border border-white/10 mt-1">
                <p className="text-xs font-medium text-white/90">
                  No allocations created for today.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-white/20" />

              {/* Resource count + arrow */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Create Allocation</span>
                <div className="h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 bg-white/20 text-white">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {first3Dates.map((date) => {
          const isToday = date === today;
          const count = allocations.filter((a) => a.date === date).length;

          return (
            <div
              key={date}
              onClick={() => onSelectDate(date)}
              className={`group relative p-5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden
                ${
                  isToday
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                    : 'bg-card text-foreground border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                }
              `}
            >
              {isToday && (
                <span className="absolute top-3 right-3 bg-white/25 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  Today
                </span>
              )}

              <div className="flex flex-col gap-4">
                {/* Day of week */}
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${isToday ? 'text-white/60' : 'text-muted-foreground'}`}
                >
                  {getDayOfWeek(date)}
                </p>

                {/* Day number + Month */}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black leading-none tracking-tight">
                    {getDayNum(date)}
                  </span>
                  <span
                    className={`text-sm font-semibold mb-1 ${isToday ? 'text-white/70' : 'text-muted-foreground'}`}
                  >
                    {getMonthYear(date)}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className={`h-px w-full ${isToday ? 'bg-white/20' : 'bg-border'}`}
                />

                {/* Resource count + arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isToday ? 'bg-white/20' : 'bg-primary/10'
                      }`}
                    >
                      <Users
                        className={`h-3.5 w-3.5 ${isToday ? 'text-white' : 'text-primary'}`}
                      />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold leading-none">
                        {count}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-widest ${isToday ? 'text-white/60' : 'text-muted-foreground'}`}
                      >
                        {count === 1 ? 'resource' : 'resources'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 ${
                      isToday
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pastAllocationsHR.length > 0 && (() => {
        const totalPagesHR = Math.ceil(totalHR / pageSizeHR);
        return (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
              Previous Allocations
            </h4>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col relative">
              <div className="grid grid-cols-12 bg-muted/40 px-4 py-3 border-b border-border shrink-0">
                <div className="col-span-4 sm:col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date
                </div>
                <div className="hidden sm:block sm:col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Day
                </div>
                <div className="col-span-4 sm:col-span-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Resources
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Action
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y divide-border/60 relative min-h-[150px]">
                {loadingHR && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                    <Activity className="h-6 w-6 text-primary animate-spin" />
                  </div>
                )}
                {pastAllocationsHR.slice((pageHR - 1) * pageSizeHR, pageHR * pageSizeHR).map(({ date, count }) => (
                  <div
                    key={date}
                    className="grid grid-cols-12 px-4 py-3.5 hover:bg-muted/20 items-center transition-colors"
                  >
                    <div className="col-span-4 sm:col-span-3 text-sm font-semibold text-foreground">
                      {format(new Date(date), 'MMM d, yyyy')}
                    </div>
                    <div className="hidden sm:block sm:col-span-3 text-sm text-muted-foreground">
                      {getDayOfWeek(date)}
                    </div>
                    <div className="col-span-4 sm:col-span-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 hidden sm:flex">
                        <Users className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">
                        {count}{' '}
                        <span className="hidden sm:inline">
                          {count === 1 ? 'resource' : 'resources'}
                        </span>
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => onSelectDate(date)}
                      >
                        View <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalHR > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/20">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <span className="text-xs text-muted-foreground">
                      Showing {Math.min((pageHR - 1) * pageSizeHR + 1, totalHR)} to{' '}
                      {Math.min(pageHR * pageSizeHR, totalHR)}{' '}
                      of {totalHR} entries
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-medium">Rows per page:</span>
                      <select
                        value={pageSizeHR}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setPageSizeHR(val);
                          setPageHR(1);
                        }}
                        className="bg-card border border-border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm hover:bg-muted/10 transition-colors"
                      >
                        {[5, 7, 10, 20, 50].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageHR((p) => Math.max(1, p - 1))}
                      disabled={pageHR === 1 || loadingHR}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageHR((p) => Math.min(totalPagesHR, p + 1))
                      }
                      disabled={pageHR === totalPagesHR || totalPagesHR <= 1 || loadingHR}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {sortedDates.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            No allocations yet
          </p>
          <p className="text-sm text-muted-foreground">
            Create an allocation to see recent activity here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllocationSheets;

function getDayOfWeek(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
}

function getDayNum(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric' });
}

function getMonthYear(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}
