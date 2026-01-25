import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import { notesApi } from '../services/api';

const Alert = ({ type, children, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  };

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg ${styles[type]} mb-4`}>
      {icons[type]}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
};

const NotesContainer = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch all notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await notesApi.getAll();
      setNotes(data.notes || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleCreateNew = () => {
    setCurrentNote(null);
    setView('editor');
  };

  const handleNoteClick = (note) => {
    setCurrentNote(note);
    setView('editor');
  };

  const handleSaveNote = async (noteData) => {
    setLoading(true);
    setMessage(null);

    try {
      if (currentNote) {
        // Update existing note
        const data = await notesApi.update(currentNote.id, noteData);
        setNotes(notes.map(n => n.id === currentNote.id ? data.note : n));
        setMessage({ type: 'success', text: 'Note updated successfully!' });
      } else {
        // Create new note
        const data = await notesApi.create(noteData);
        setNotes([data.note, ...notes]);
        setMessage({ type: 'success', text: 'Note created successfully!' });
      }
      
      setTimeout(() => {
        setView('list');
        setCurrentNote(null);
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesApi.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      setMessage({ type: 'success', text: 'Note deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleCancel = () => {
    setView('list');
    setCurrentNote(null);
  };

  return (
    <div>
      {message && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert type={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        </div>
      )}

      {view === 'list' ? (
        <NotesList
          notes={notes}
          onNoteClick={handleNoteClick}
          onDeleteNote={handleDeleteNote}
          onCreateNew={handleCreateNew}
        />
      ) : (
        <NoteEditor
          note={currentNote}
          onSave={handleSaveNote}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </div>
  );
};

export default NotesContainer;