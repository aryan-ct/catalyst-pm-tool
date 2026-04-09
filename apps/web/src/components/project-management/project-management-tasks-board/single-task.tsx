import TasksDropDown from '@/components/common/dropdown/TasksDropDown';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

const SingleTask = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="p-4">
        <div className=" flex justify-between items-center">
          <div className="p-1 py-[4px] bg-green-500/15 rounded-3xl px-2 pr-4 font-medium text-green-900 flex items-center gap-1 text-sm">
            <ArrowDown className="mb-[2px] h-[12px]" />
            <span className="text-[12px]">Low</span>
          </div>
          <TasksDropDown />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 mt-1">
        <span className="font-bold text-lg">Copywriting content</span>
        <span className="text-sm text-gray-600">Create content</span>
      </CardContent>
    </Card>
  );
};

export default SingleTask;
