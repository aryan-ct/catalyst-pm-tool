import * as React from 'react';
import { ChevronsUpDown, Plus, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function TaskCombobox({
  allTasks,
  selectedTaskId,
  onSelectTask,
  onCreateCustomTask,
  className,
}: {
  allTasks: any[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  onCreateCustomTask: (taskDesc: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedTask = allTasks.find((task) => task.id === selectedTaskId);

  // Force re-render of command empty when inputValue changes to show dynamic text
  const isExactMatch = allTasks.some(
    (task) => task.title.toLowerCase() === inputValue.toLowerCase(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={'!w-full'}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-10 justify-between font-normal shadow-sm border-border bg-background rounded-lg hover:border-primary/50 transition-colors text-left"
        >
          <span className="truncate w-full">
            {selectedTask ? selectedTask.title : 'Select a task...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput
            placeholder="Search existing tasks or type to create..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-auto py-2 whitespace-normal text-left"
                onClick={() => {
                  onCreateCustomTask(inputValue);
                  setOpen(false);
                  setInputValue('');
                }}
              >
                <Plus className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium">
                  Create custom task: "{inputValue}"
                </span>
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {allTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.title}
                  onSelect={() => {
                    onSelectTask(task.id);
                    setOpen(false);
                    setInputValue('');
                  }}
                  className="cursor-pointer py-2"
                >
                  <CheckCircle2
                    className={cn(
                      'mr-2 h-4 w-4 text-primary',
                      selectedTaskId === task.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {task.title}
                </CommandItem>
              ))}

              {inputValue && !isExactMatch && allTasks.length > 0 && (
                <div className="p-1 border-t border-border mt-1 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-auto py-2 whitespace-normal text-left"
                    onClick={() => {
                      onCreateCustomTask(inputValue);
                      setOpen(false);
                      setInputValue('');
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium">Create "{inputValue}"</span>
                  </Button>
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
