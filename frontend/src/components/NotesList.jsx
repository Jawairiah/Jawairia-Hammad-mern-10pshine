import React from 'react';
import { FileText, Trash2, Edit, Calendar, Plus } from 'lucide-react';

const NotesList = ({ notes, onNoteClick, onDeleteNote, onCreateNew }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getPreview = (content) => {
    const text = stripHtml(content);
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Notes</h2>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-6">Create your first note to get started</p>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition cursor-pointer border border-gray-200 group"
                onClick={() => onNoteClick(note)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNoteClick(note);
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {getPreview(note.content)}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(note.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesList;