import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AllocationDetails from './AllocationDetails';
import { useResourceAllocation } from '../ResourceAllocationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

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
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Select a date to view or manage resource allocations.</p>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-64 justify-start text-left font-normal border-border bg-card shadow-sm hover:bg-accent transition-all"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {pickerDate ? format(pickerDate, 'PPP') : 'View historical data'}
            </Button>
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
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'bg-card text-foreground border-border hover:border-primary hover:shadow-md'
                }
              `}
            >
              {isToday && (
                <div className="absolute top-0 right-0 p-1">
                   <div className="bg-white/20 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">Today</div>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <div className={`text-sm font-semibold opacity-80 ${isToday ? 'text-white' : 'text-muted-foreground'}`}>
                  {formatDate(date)}
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight">{count}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Resources</span>
                  </div>
                  
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                    isToday ? 'bg-white/20' : 'bg-primary/10 text-primary'
                  }`}>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {latest10Dates.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mx-auto mb-3">
             <CalendarIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground font-medium">No allocation data found for the last 10 days.</p>
        </div>
      )}
    </div>
  );
};

export default AllocationSheets;

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}
