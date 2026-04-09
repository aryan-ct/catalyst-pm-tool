import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TaskName(){
    return (
        <div className="flex flex-col gap-2">
            <Label className="opacity-75 text-sm font-medium">Task Title</Label>
            <Input placeholder="John Doe.." className="h-11"/>
            <div className="text-red-500 text-[12px] flex items-center gap-1">
              <p>This is an error.</p>
            </div>
        </div>
    )
}