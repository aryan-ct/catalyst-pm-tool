import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent, useState } from 'react';

export default function TaskDescription() {
  const [textCounter, setTextCounter] = useState('');

  function handleTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const textInput = e.target.value;
    if (textInput.length <= 50) {
      setTextCounter(textInput);
    }
  }
  return (
    <div className="flex flex-col gap-2 mt-4">
      <Label className="opacity-75 text-sm font-medium">Task Description</Label>
      <Textarea
        value={textCounter}
        onChange={handleTextChange}
        placeholder="Give description.."
        className="resize-none"
      />
      <div className="flex justify-between items-center">
        <div className="text-red-500 text-[12px] flex items-center gap-1">
          <p>This is an error.</p>
        </div>
        <p className="text-[12px]" text-gray-500>
          {textCounter.length} / 50 characters
        </p>
      </div>
    </div>
  );
}
