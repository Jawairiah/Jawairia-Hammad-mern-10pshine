import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Calendar,
  X,
  Loader2,
  FileText,
  StickyNote as NoteIcon,
} from 'lucide-react';
import NoteEditor from './NoteEditor';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

const NotesContainer = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter notes whenever search query or notes change
  useEffect(() => {
    filterNotes();
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall('/notes');
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter((note) => {
      // Search in title
      const titleMatch = note.title.toLowerCase().includes(query);
      
      // Search in content (strip HTML tags for better search)
      const contentText = stripHtml(note.content).toLowerCase();
      const contentMatch = contentText.includes(query);

      return titleMatch || contentMatch;
    });

    setFilteredNotes(filtered);
  };

  // Helper function to strip HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleCreateNote = async (noteData) => {
    try {
      setSaving(true);
      const data = await apiCall('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      });
      setNotes([data.note, ...notes]);
      setIsCreatingNew(false);
      setEditingNote(null);
    } catch (err) {
      setError(err.message);
      console.error('Error creating note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      setSaving(true);
      const data = await apiCall(`/notes/${editingNote.id}`, {
        method: 'PUT',
        body: JSON.stringify(noteData),
      });
      setNotes(notes.map((n) => (n.id === editingNote.id ? data.note : n)));
      setEditingNote(null);
      setIsCreatingNew(false);
    } catch (err) {
      setError(err.message);
      console.error('Error updating note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await apiCall(`/notes/${id}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter((n) => n.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting note:', err);
    }
  };

  const handleSaveNote = (noteData) => {
    if (isCreatingNew) {
      handleCreateNote(noteData);
    } else {
      handleUpdateNote(noteData);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsCreatingNew(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPreviewText = (html, maxLength = 150) => {
    const text = stripHtml(html);
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Show editor if creating or editing
  if (isCreatingNew || editingNote) {
    return (
      <NoteEditor
        note={editingNote}
        onSave={handleSaveNote}
        onCancel={handleCancelEdit}
        loading={saving}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Search and Create Button */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-800">My Notes</h2>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-sm text-gray-600">
            Found {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {searchQuery ? (
            <>
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notes found
              </h3>
              <p className="text-gray-500 mb-6">
                Try a different search term or create a new note
              </p>
              <button
                onClick={clearSearch}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notes yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start creating your first note to get started!
              </p>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Create First Note
              </button>
            </>
          )}
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <NoteIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                      {note.title}
                    </h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {getPreviewText(note.content)}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(note.updated_at || note.created_at)}</span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(note.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Delete Note?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesContainer;