import { useState } from 'react';
import NoteInput from '../components/NoteInput';
import Results from '../components/Results';

// Mock AI output. just some dummy info when you hit generate to test the UI we will repalce later.
const MOCK_RESULTS = {
  summary:
    'These notes cover the core ideas of the topic: the main definitions, ' +
    'why they matter, and how the key concepts connect to each other. ' +
    'Focus your review on the relationships between terms rather than ' +
    'memorizing each one in isolation.',
  keywords: [
    'Definition',
    'Key concept',
    'Cause and effect',
    'Example',
    'Application',
  ],
  questions: [
    'In your own words, what is the main idea of these notes?',
    'How do the key concepts relate to one another?',
    'Can you give a real-world example of this topic?',
    'What would happen if one of these factors changed?',
  ],
};

function Home() {

  const [notes, setNotes] = useState(''); // text in the textarea
  const [fileName, setFileName] = useState(''); // name of the uploaded file
  const [loading, setLoading] = useState(false); // loading
  const [error, setError] = useState(''); // error handling and validation
  const [results, setResults] = useState(null); // null = nothing generated yet

  // Runs when the "Generate Study Guide" button is clicked.
  function handleGenerate() {
    // alidate: need EITHER notes OR a file (or both).
    const hasNotes = notes.trim() !== '';
    const hasFile = fileName !== '';
    if (!hasNotes && !hasFile) {
      setError('Please paste your notes or upload a file first.');
      return; 
    }

    // Clear old state and show the loading message.
    setError('');
    setResults(null);
    setLoading(true);


    // TODO (backend): replace this setTimeout with a real API call, e.g.
    //   const res = await fetch('/api/generate', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ notes }),
    //   });
    //   const data = await res.json();
    //   setResults(data);
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setLoading(false);
    }, 1000);
  }

  // Validates and stores the chosen file. Real upload happens in the backend 
  function handleFileChange(event) {
    const file = event.target.files[0];

    // if no file then reset
    if (!file) {
      setFileName('');
      return;
    }

    // I hardcoded the allowed formats just in case lol also made a cap limit for the size. 
    const allowedExtensions = ['.doc', '.docx', '.pdf', '.ppt', '.pptx', '.txt'];
    const maxSizeBytes = 40 * 1024 * 1024; // 40 MB

    // Check the file extensions
    const name = file.name.toLowerCase();
    const isAllowedType = allowedExtensions.some((ext) => name.endsWith(ext));
    if (!isAllowedType) {
      setError('Unsupported file type. Please upload a Word, PDF, PowerPoint, or .txt file.');
      setFileName('');
      event.target.value = ''; // reset so the same file can be re-picked later
      return;
    }

    // Check the file size.
    if (file.size > maxSizeBytes) {
      setError('That file is too large. Please upload a file smaller than 40 MB.');
      setFileName('');
      event.target.value = '';
      return;
    }

    // TODO (backend): read the file and send its contents to the API.
    setFileName(file.name); // remember the file so Generate is enabled
    setError(''); // clear any previous error
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Study Helper</h1>
        <p className="subtitle">
          Paste or upload your course notes and Study Helper generates a
          summary, the key concepts, and practice questions to help you study.
        </p>
      </header>

      {/* Inputs textarea, file upload, button, error message */}
      <NoteInput
        notes={notes}
        onNotesChange={setNotes}
        onFileChange={handleFileChange}
        onGenerate={handleGenerate}
        fileName={fileName}
        error={error}
        loading={loading}
      />

      {/* Loading message OR results  */}
      {loading && <p className="loading">Generating your study guide…</p>}
      {!loading && results && <Results results={results} />}
    </main>
  );
}

export default Home;
