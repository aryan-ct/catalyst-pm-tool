import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { CheckCheckIcon } from 'lucide-react';
import { useState } from 'react';

type PriorityItem = {
  name: string;
  textColor: string;
  backgroundColor: string;
};

const PriorityListArray: PriorityItem[] = [
  {
    name: 'Low',
    textColor: 'text-green-700',
    backgroundColor: 'bg-green-500/10',
  },
  {
    name: 'Medium',
    textColor: 'text-yellow-700',
    backgroundColor: 'bg-yellow-500/10',
  },
  { name: 'High', textColor: 'text-red-700', backgroundColor: 'bg-red-500/10' },
];

export default function PriorityList() {
  const [selectedPriority, setSelectedPriority] = useState<PriorityItem>(
    PriorityListArray[0],
  );

  function renderSelectedPriority() {
    return (
      <div className="flex items-center gap-2">
        {/* <div className={`size-6 ${selectedPriority.backgroundColor} rounded-md flex items-center justify-center text-lg ${selectedPriority.textColor}`}>
                    <selectedPriority.icon/>
                </div> */}
        <span className={`${selectedPriority.textColor}`}>
          {selectedPriority.name}
        </span>
      </div>
    );
  }

  function renderDropDownMenuItem(priorityItem: PriorityItem) {
    return (
      <div className="flex items-center gap-2">
        <span className={`$priorityItem.textColor`}>{priorityItem.name}</span>
      </div>
    );
  }

  function isDropDownItemChecked(priorityItem: PriorityItem) {
    return (
      <>{priorityItem.name === selectedPriority.name && <CheckCheckIcon />}</>
    );
  }

  return (
    <div>
      <Label className="opacity-75 text-sm font-medium">Priority</Label>
      <div className="mt-2 w-full">
        <DropdownMenu>
          <DropdownMenuTrigger>{renderSelectedPriority()}</DropdownMenuTrigger>
          <DropdownMenuContent>
            {PriorityListArray.map((priorityItem, index) => (
              <DropdownMenuItem
                className="flex justify-between items-center"
                onClick={() => {
                  setSelectedPriority(priorityItem);
                }}
                key={index}
              >
                {renderDropDownMenuItem(priorityItem)}
                {isDropDownItemChecked(priorityItem)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
