import { useState } from 'react';
import AllocationDetails from './AllocationDetails';
import { useResourceAllocation } from '../ResourceAllocationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, ArrowRight, Activity } from 'lucide-react';

const AllocationSheets = ({
  onSelectDate,
}: {
  onSelectDate: (date: string) => void;
}) => {
  const today = new Date().toDateString();
  const { allocations } = useResourceAllocation();

  const uniqueDates = [...new Set(allocations.map((a) => a.date))];

  const sortedDates = uniqueDates.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const latest10Dates = sortedDates.slice(0, 10);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Activity className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground leading-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Select a date to view or manage resource allocations.</p>
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
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latest10Dates.map((date) => {
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
                <p className={`text-xs font-semibold uppercase tracking-widest ${isToday ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {getDayOfWeek(date)}
                </p>

                {/* Day number + Month */}
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black leading-none tracking-tight">
                    {getDayNum(date)}
                  </span>
                  <span className={`text-sm font-semibold mb-1 ${isToday ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {getMonthYear(date)}
                  </span>
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${isToday ? 'bg-white/20' : 'bg-border'}`} />

                {/* Resource count + arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isToday ? 'bg-white/20' : 'bg-primary/10'
                    }`}>
                      <Users className={`h-3.5 w-3.5 ${isToday ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold leading-none">{count}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-widest ${isToday ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {count === 1 ? 'resource' : 'resources'}
                      </span>
                    </div>
                  </div>

                  <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 ${
                    isToday ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {latest10Dates.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">No allocations yet</p>
          <p className="text-sm text-muted-foreground">Create an allocation to see recent activity here.</p>
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
