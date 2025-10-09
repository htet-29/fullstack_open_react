import { useState, useEffect } from "react";
import noteService from "./services/note";
import Note from "./components/Note";
import Notification from "./components/Notification";
import Footer from "./components/Footer";

const App = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('a new note...');
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null);
    
    const hook = () => {
        console.log("effect");
        noteService
            .getAll()
            .then(initialNotes => {
                console.log('promise fullfilled');
                setNotes(initialNotes)
            })
    };
    
    useEffect(hook, []);
    
    console.log('render', notes.length, 'notes');
    
    
    const notesToShow = showAll ? notes : notes.filter(note => note.important);
    
    const addNote = (event) => {
        event.preventDefault()
        const noteObject = {
            content: newNote,
            important: Math.random() < 0.5,
        }
        
        noteService
            .create(noteObject)
            .then(returnNote => {
                setNotes(notes.concat(returnNote)) // doesn't mutate original notes array
                setNewNote('')
            })
    }
    
    const toggleImportanceOf = (id) => {
        const note = notes.find(n => n.id === id);
        const changeNote = { ...note, important: !note.important };
        
        noteService
            .update(id, changeNote)
            .then(returnNote => {
                setNotes(notes.map(note => note.id === id ? returnNote : note));
            })
            .catch((error) => {
                setErrorMessage(
                    `Note '${note.content}' was already removed from server`
                );
                
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000);
                setNotes(notes.filter(n => n.id !== id))
            })
    }

    const handleNoteChange = (event) => {
        setNewNote(event.target.value);
    }
    return (
        <div>
            <h1>Notes Taking App with Backend</h1>
            <Notification message={errorMessage}/>
            <div>
                <button onClick={() => setShowAll(!showAll)}>
                    show {showAll ? 'important' : 'all'}
                </button>
            </div>
            <ul>
                { notesToShow && notesToShow.map(note => 
                    <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)} />
                )}
            </ul>
            <form onSubmit={addNote}>
                <input onChange={handleNoteChange} value={newNote} />
                <button type="submit">save</button>
            </form>
            <Footer />
        </div>
    )
}

export default App;