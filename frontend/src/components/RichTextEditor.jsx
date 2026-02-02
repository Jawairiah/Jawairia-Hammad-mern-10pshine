import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  List, 
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
  Leaf,
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...' }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      const selection = saveSelection();
      editorRef.current.innerHTML = value || '';
      if (selection) {
        restoreSelection(selection);
      }
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range) => {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };

  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2.5 rounded-xl hover:bg-sage-100 transition-all ${
        active ? 'bg-sage-100 text-sage-800' : 'text-sage-600'
      }`}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="rich-text-editor border-2 border-sage-200 rounded-2xl overflow-hidden bg-warm-white shadow-sm">
      {/* Toolbar */}
      <div className="border-b-2 border-sage-100 bg-sage-50/50 p-3 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <div className="flex gap-1 pr-3 border-r-2 border-sage-200">
          <ToolbarButton
            onClick={() => execCommand('bold')}
            active={isCommandActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('italic')}
            active={isCommandActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('underline')}
            active={isCommandActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('strikeThrough')}
            active={isCommandActive('strikeThrough')}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-3 border-r-2 border-sage-200">
          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            active={isCommandActive('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList')}
            active={isCommandActive('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-3 border-r-2 border-sage-200">
          <ToolbarButton
            onClick={() => execCommand('justifyLeft')}
            active={isCommandActive('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyCenter')}
            active={isCommandActive('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyRight')}
            active={isCommandActive('justifyRight')}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-3 border-r-2 border-sage-200">
          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-3 py-2 rounded-xl border-2 border-sage-200 bg-white text-sm text-sage-700 focus:border-sage-400 focus:outline-none transition-all font-medium"
            onMouseDown={(e) => e.preventDefault()}
          >
            <option value="p">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton onClick={insertLink} title="Insert Link">
            <Link size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Quote"
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('formatBlock', 'pre')}
            title="Code Block"
          >
            <Code size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {/* Decorative leaf in corner */}
        <div className="absolute top-4 right-4 opacity-[0.03] pointer-events-none">
          <Leaf className="w-16 h-16 text-sage-600" />
        </div>
        
        <div
          ref={editorRef}
          contentEditable
          className={`p-6 min-h-[400px] outline-none relative z-10 ${
            !isFocused && !editorRef.current?.innerHTML ? 'text-sage-400' : 'text-sage-800'
          }`}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            lineHeight: '1.8',
            fontSize: '16px',
          }}
        />
      </div>

      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--sage-300);
          pointer-events: none;
          position: absolute;
          font-style: italic;
        }
        
        .rich-text-editor h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
          color: var(--sage-800);
          font-family: 'Crimson Pro', serif;
        }
        
        .rich-text-editor h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.75em 0;
          color: var(--sage-800);
          font-family: 'Crimson Pro', serif;
        }
        
        .rich-text-editor h3 {
          font-size: 1.17em;
          font-weight: 600;
          margin: 0.83em 0;
          color: var(--sage-700);
          font-family: 'Crimson Pro', serif;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid var(--sage-400);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          color: var(--sage-700);
          font-style: italic;
          background: var(--sage-50);
          padding: 1rem 1.5rem;
          border-radius: 0 1rem 1rem 0;
        }
        
        .rich-text-editor pre {
          background-color: var(--sage-50);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          border: 2px solid var(--sage-200);
          color: var(--sage-800);
        }
        
        .rich-text-editor ul, .rich-text-editor ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        
        .rich-text-editor li {
          margin: 0.5rem 0;
          color: var(--sage-800);
        }
        
        .rich-text-editor a {
          color: var(--sky-600);
          text-decoration: underline;
          text-decoration-color: var(--sky-300);
          text-underline-offset: 3px;
          transition: all 0.2s;
        }
        
        .rich-text-editor a:hover {
          color: var(--sky-700);
          text-decoration-color: var(--sky-600);
        }
        
        .rich-text-editor p {
          margin: 0.75em 0;
          color: var(--sage-800);
        }
        
        .rich-text-editor strong {
          font-weight: 600;
          color: var(--sage-900);
        }
        
        .rich-text-editor em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;