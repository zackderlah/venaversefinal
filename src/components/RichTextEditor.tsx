import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_CHARACTERS = 1000;

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      Link,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-4',
        },
      }),
      ListItem,
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic',
        },
      }),
      Image,
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-4',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Update word count
      const plainText = editor.getText();
      const words = plainText.trim().split(/\s+/).filter(Boolean);
      setWordCount(plainText.trim() ? words.length : 0);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] w-full border-none outline-none bg-transparent text-black dark:text-white resize-y prose prose-sm dark:prose-invert max-w-none p-4',
        style: 'min-height: 240px;',
      },
    },
  });

  // Keep editor content in sync with value prop
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // Update char count if value changes externally
    if (editor) {
      setCharCount(editor.getText().length);
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // Update word count if value changes externally
    if (editor) {
      const plainText = editor.getText();
      const words = plainText.trim().split(/\s+/).filter(Boolean);
      setWordCount(plainText.trim() ? words.length : 0);
    }
  }, [value, editor]);

  // Toolbar based on the Simple Editor template, icon-only, styled for your theme
  const btnBase =
    'p-1 rounded transition-colors duration-100 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-800';
  const btnActive =
    'text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-800';
  const iconClass = 'w-5 h-5 stroke-2';

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
      <div className="flex items-center gap-1 px-1 py-1 border-b border-gray-200 dark:border-gray-600 bg-transparent rounded-t">
        <button
          type="button"
          title="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`${btnBase} ${editor?.isActive('bold') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z" /></svg>
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${editor?.isActive('italic') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 4h-9M10 20h9M15 4l-6 16" /></svg>
        </button>
        <button
          type="button"
          title="Underline"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`${btnBase} ${editor?.isActive('underline') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" /></svg>
        </button>
        <button
          type="button"
          title="Strikethrough"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`${btnBase} ${editor?.isActive('strike') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 12h12M7 5a7 7 0 0 1 10 2c1 2-1 4-5 4" /></svg>
        </button>
        <button
          type="button"
          title="Bullet List"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${editor?.isActive('bulletList') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="6" cy="6" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><path d="M10 6h10M10 12h10M10 18h10" /></svg>
        </button>
        <button
          type="button"
          title="Ordered List"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${editor?.isActive('orderedList') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><text x="3" y="8" fontSize="6">1.</text><path d="M10 6h10M10 12h10M10 18h10" /></svg>
        </button>
        <button
          type="button"
          title="Task List"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          className={`${btnBase} ${editor?.isActive('taskList') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12l2 2l4-4"/></svg>
        </button>
        <button
          type="button"
          title="Blockquote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`${btnBase} ${editor?.isActive('blockquote') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 17a4 4 0 0 1 0-8V7a7 7 0 0 0 0 14zm10 0a4 4 0 0 1 0-8V7a7 7 0 0 0 0 14z" /></svg>
        </button>
        <button
          type="button"
          title="Add Link"
          onClick={() => {
            const url = window.prompt('Enter a URL');
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          className={`${btnBase} ${editor?.isActive('link') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 1 7 7l-1 1a5 5 0 0 1-7-7m2-2a5 5 0 0 0-7 7l1 1a5 5 0 0 0 7-7" /></svg>
        </button>
        <button
          type="button"
          title="Remove Link"
          onClick={() => editor?.chain().focus().unsetLink().run()}
          className={`${btnBase} ${!editor?.isActive('link') ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17l-2.5-2.5M7 7l2.5 2.5M8 12h8" /></svg>
        </button>
        <button
          type="button"
          title="Align Left"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          className={`${btnBase} ${editor?.isActive({ textAlign: 'left' }) ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16" /></svg>
        </button>
        <button
          type="button"
          title="Align Center"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          className={`${btnBase} ${editor?.isActive({ textAlign: 'center' }) ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 6h12M4 12h16M6 18h12" /></svg>
        </button>
        <button
          type="button"
          title="Align Right"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          className={`${btnBase} ${editor?.isActive({ textAlign: 'right' }) ? btnActive : ''}`}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M10 12h10M4 18h16" /></svg>
        </button>
        <button
          type="button"
          title="Undo"
          onClick={() => editor?.chain().focus().undo().run()}
          className={btnBase}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 14l-4-4 4-4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></svg>
        </button>
        <button
          type="button"
          title="Redo"
          onClick={() => editor?.chain().focus().redo().run()}
          className={btnBase}
        >
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4 4-4 4" /><path d="M19 14H8a4 4 0 1 1 0-8h1" /></svg>
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-end px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
        {wordCount} word{wordCount === 1 ? '' : 's'}
      </div>
    </div>
  );
} 