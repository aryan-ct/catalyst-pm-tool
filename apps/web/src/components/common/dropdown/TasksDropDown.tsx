import { Delete, Edit, MoreVertical } from 'lucide-react';
import { JSX } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type MenuItem = {
  icon: JSX.Element;
  label: string;
  className: string;
  separator?: undefined;
};

const TasksDropDown = () => {
  const menuItems: MenuItem[] = [
    { icon: <Edit />, label: 'Edit Task', className: '' },
    {
      icon: <Delete className="text-lg" />,
      label: 'Delete Task',
      className: 'text-red-600',
    },
  ];
  return (
    <div>
      {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {menuItems?.map((item,index)=>
                item.separator ?(
                    <DropdownMenuSeparator key={index}/> 
                ):(<DropdownMenuItem key={index} className={`flex items-center gap-1 p-[10px] ${item.className}`}>
                    {item.icon}
                    <span>{item.label}</span>
                </DropdownMenuItem>))}
            </DropdownMenuContent>
        </DropdownMenu> */}

      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer">
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {menuItems?.map((item, index) =>
            item.separator ? (
              <DropdownMenuSeparator key={index} />
            ) : (
              <DropdownMenuItem
                key={index}
                className={`flex items-center gap-2 p-[10px] ${item.className}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TasksDropDown;
