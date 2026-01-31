import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, Leaf, CheckCircle } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

const NoteEditor = ({ note, onSave, onCancel, loading }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    }
  }, [note]);

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'A title helps you find this note later';
    } else if (title.length > 255) {
      newErrors.title = 'Title is a bit too long (max 255 characters)';
    }

    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Your thoughts are waiting to be written';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      await onSave({ title: title.trim(), content });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    // Save on Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 pb-12 fade-in" onKeyDown={handleKeyDown}>
      <div className="bg-warm-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-sage-100 relative">
        {/* Decorative leaf */}
        <div className="absolute top-6 right-6 opacity-[0.05]">
          <Leaf className="w-24 h-24 text-sage-600 transform rotate-12" />
        </div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-sage-600 hover:text-sage-800 font-medium transition-all px-4 py-2 rounded-xl hover:bg-sage-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Notes
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white font-medium px-6 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Note
              </>
            )}
          </button>
        </div>

        {/* Save Success Message */}
        {showSaveSuccess && (
          <div className="mb-6 bg-sage-50 border-2 border-sage-300 text-sage-800 px-5 py-4 rounded-2xl flex items-center gap-3 fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Note saved successfully!</span>
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Note title..."
              className={`w-full text-3xl font-bold border-0 border-b-2 pb-4 focus:outline-none focus:border-sage-500 transition bg-transparent placeholder:text-sage-300 ${
                errors.title ? 'border-red-300' : 'border-sage-200'
              }`}
              style={{ fontFamily: 'Crimson Pro, serif' }}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-3 px-1">{errors.title}</p>
            )}
          </div>

          <div>
            <RichTextEditor
              value={content}
              onChange={(html) => {
                setContent(html);
                if (errors.content) setErrors({ ...errors, content: '' });
              }}
              placeholder="Let your thoughts flow..."
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-3 px-1">{errors.content}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t-2 border-sage-100">
            <p className="text-sm text-sage-500 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span>Press <kbd className="px-2 py-1 bg-sage-50 rounded text-xs font-mono border border-sage-200">Ctrl</kbd> + <kbd className="px-2 py-1 bg-sage-50 rounded text-xs font-mono border border-sage-200">S</kbd> to save</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 border-2 border-sage-200 rounded-2xl hover:bg-sage-50 transition-all font-medium text-sage-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-sage-600 hover:bg-sage-700 disabled:bg-sage-300 text-white px-6 py-2.5 rounded-2xl transition-all font-medium shadow-md"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;