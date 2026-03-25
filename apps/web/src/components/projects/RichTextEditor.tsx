// src/components/projects/RichTextEditor.tsx

export default function RichTextEditor({ value, onChange }: any) {
  return (
    <div className="border rounded-md p-2 space-y-2">
      
      {/* Toolbar */}
      <div className="flex gap-2 text-sm">
        <button onClick={() => document.execCommand("bold")}>B</button>
        <button onClick={() => document.execCommand("underline")}>U</button>
        <button onClick={() => document.execCommand("strikeThrough")}>S</button>
        <button onClick={() => document.execCommand("insertUnorderedList")}>•</button>
        <button onClick={() => document.execCommand("insertOrderedList")}>1.</button>
      </div>

      {/* Editor */}
      <div
        contentEditable
        className="min-h-[80px] border p-2 rounded"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e: any) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}