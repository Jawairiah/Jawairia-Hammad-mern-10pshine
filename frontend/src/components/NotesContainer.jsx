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
  Leaf,
  Mountain,
  Trees,
  Flower2,
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

  const getPreviewText = (html, maxLength = 120) => {
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

  // Get random nature icon for note cards
  const getNatureIcon = (index) => {
    const icons = [
      <Leaf className="w-5 h-5 text-sage-600" />,
      <Flower2 className="w-5 h-5 text-sage-600" />,
      <Trees className="w-5 h-5 text-moss-600" />,
      <Mountain className="w-5 h-5 text-sage-600" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-12">
      {/* Header with Search and Create Button */}
      <div className="mb-8 space-y-5 fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-3xl font-bold text-sage-800" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Your Reflections
          </h2>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through your notes..."
            className="w-full pl-14 pr-14 py-4 border-2 border-sage-200 bg-warm-white rounded-2xl focus:border-sage-400 focus:ring-2 focus:ring-sage-200 outline-none transition text-base placeholder:text-sage-300"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="text-sm text-sage-600 px-2">
            Found {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} matching "<span className="font-medium">{searchQuery}</span>"
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl fade-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-4">
            <Leaf className="w-14 h-14 text-sage-400 gentle-pulse" />
          </div>
          <p className="text-sage-600 font-medium">Gathering your notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
          {searchQuery ? (
            <>
              <div className="bg-sage-50 p-6 rounded-3xl mb-5">
                <Search className="w-16 h-16 text-sage-300" />
              </div>
              <h3 className="text-2xl font-semibold text-sage-700 mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                No notes found
              </h3>
              <p className="text-sage-600 mb-6 max-w-md">
                We couldn't find any notes matching your search. Try different keywords or create a new note.
              </p>
              <button
                onClick={clearSearch}
                className="text-sage-700 hover:text-sage-900 font-semibold hover:underline"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <div className="bg-sage-50 p-6 rounded-3xl mb-5">
                <Trees className="w-16 h-16 text-sage-400" />
              </div>
              <h3 className="text-2xl font-semibold text-sage-700 mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Your forest awaits
              </h3>
              <p className="text-sage-600 mb-8 max-w-md">
                Start your journey by planting your first note. Let your thoughts grow and flourish.
              </p>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Create First Note
              </button>
            </>
          )}
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className="bg-warm-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-sage-100 relative stagger-item"
            >
              {/* Subtle corner decoration */}
              <div className="absolute top-3 right-3 opacity-[0.08]">
                {getNatureIcon(index)}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-sage-50 p-2 rounded-xl mt-0.5">
                      {getNatureIcon(index)}
                    </div>
                    <h3 className="text-lg font-semibold text-sage-800 line-clamp-2 flex-1" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      {note.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sage-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {getPreviewText(note.content)}
                </p>

                <div className="flex items-center gap-2 text-xs text-sage-500 mb-5 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(note.updated_at || note.created_at)}</span>
                </div>

                <div className="flex gap-2.5 pt-4 border-t-2 border-sage-50">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="flex-1 bg-sage-50 hover:bg-sage-100 text-sage-700 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(note.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
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
        <div className="fixed inset-0 bg-sage-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-warm-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-sage-100">
            <div className="text-center mb-6">
              <div className="bg-red-50 p-4 rounded-2xl inline-block mb-4">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-sage-800" style={{ fontFamily: 'Crimson Pro, serif' }}>
                Delete this note?
              </h3>
              <p className="text-sage-600">
                This action cannot be undone. Your note will be permanently removed from your collection.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-sage-100 hover:bg-sage-200 text-sage-800 px-4 py-3 rounded-2xl transition-all font-medium"
              >
                Keep Note
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl transition-all font-medium shadow-md"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesContainer;