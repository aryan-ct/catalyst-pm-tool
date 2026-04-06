import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";

export default function RichTextEditor({ value, onChange }: any) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold"),
      underline: editor?.isActive("underline"),
      strike: editor?.isActive("strike"),
      bullet: editor?.isActive("bulletList"),
      ordered: editor?.isActive("orderedList"),
    }),
  });

  if (!editor) return null;

  return (
    <div className="border rounded-md p-2 space-y-2">

      {/* Toolbar */}
      <div className="flex gap-2">

        <Button
          variant={state.bold ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </Button>

        <Button
          variant={state.underline ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </Button>

        <Button
          variant={state.strike ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </Button>

        <Button
          variant={state.bullet ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </Button>

        <Button
          variant={state.ordered ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </Button>

      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[100px] border rounded-md p-2 focus:outline-none
                   [&_ul]:list-disc [&_ul]:pl-5
                   [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}