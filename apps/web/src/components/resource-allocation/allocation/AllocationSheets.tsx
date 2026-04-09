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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              className="w-52 justify-start text-left font-normal"
            >
              {pickerDate ? format(pickerDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={pickerDate}
              onSelect={(date) => {
                setPickerDate(date);

                if (date) {
                  setSelectedDate(date.toDateString());
                }
              }}
            />
          </PopoverContent>
        </Popover>

        {/* <Button
          onClick={() => setSelectedDate(today)}
          className="bg-blue-600 text-white"
        >
          Add Allocation for today
        </Button> */}
      </div>

      <Card className="w-full">
        <CardContent className="p-4 space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            Latest 10 days data
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
            {latest10Dates.map((date) => {
              const isToday = date === today;

              const count = allocations.filter((a) => a.date === date).length;

              return (
                <div
                  key={date}
                  // onClick={() => setSelectedDate(date)}
                  onClick={() => onSelectDate(date)}
                  className={`w-full border rounded-lg px-4 py-3 cursor-pointer transition-all
                    ${
                      isToday
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-background hover:bg-muted'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {formatDate(date)}
                      {isToday && ' (Today)'}
                    </span>

                    <span className="text-sm opacity-80">
                      {count} resources
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground py-10">
        Select a date to view allocation
      </div>
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
