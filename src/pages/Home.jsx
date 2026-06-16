import { useState } from 'react';
import NoteInput from '../components/NoteInput';
import Results from '../components/Results';
import {FaRobot, FaScroll, FaClipboardList, FaQuestion, FaBug} from 'react-icons/fa' ;

function Home() {

  const [notes, setNotes] = useState(''); // text in the textarea
  const [file, setFile] = useState(null); // the actual File object to upload
  const [fileName, setFileName] = useState(''); // name of the uploaded file (for display)
  const [loading, setLoading] = useState(false); // loading
  const [error, setError] = useState(''); // error handling and validation
  const [results, setResults] = useState(null); // null = nothing generated yet

  // Runs when the "Generate Study Guide" button is clicked.
  async function handleGenerate() {
    // Validate: need EITHER notes OR a file (or both).
    const hasNotes = notes.trim() !== '';
    const hasFile = file !== null;
    if (!hasNotes && !hasFile) {
      setError('Please paste your notes or upload a file first.');
      return;
    }

    // Clear old state and show the loading message.
    setError('');
    setResults(null);
    setLoading(true);

    try {
      let blobName;
      let uploadedName;

      // 1. If a file was chosen, upload it. The backend stores it in Blob Storage
      //    and returns the blob name we reference in the next step.
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to upload the file.');
        }
        const data = await uploadRes.json();
        blobName = data.blobName;
        uploadedName = data.fileName;
      }

      // 2. Ask the backend to extract the text + run the LLM. Returns
      //    { summary, keywords, questions } — exactly what <Results> expects.
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, blobName, fileName: uploadedName }),
      });
      if (!genRes.ok) {
        const data = await genRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate the study guide.');
      }

      const studyGuide = await genRes.json();
      setResults(studyGuide);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Validates and stores the chosen file. The actual upload happens in handleGenerate.
  function handleFileChange(event) {
    const selected = event.target.files[0];

    // if no file then reset
    if (!selected) {
      setFile(null);
      setFileName('');
      return;
    }

    // I hardcoded the allowed formats just in case lol also made a cap limit for the size.
    const allowedExtensions = ['.doc', '.docx', '.pdf', '.ppt', '.pptx', '.txt'];
    const maxSizeBytes = 40 * 1024 * 1024; // 40 MB

    // Check the file extensions
    const name = selected.name.toLowerCase();
    const isAllowedType = allowedExtensions.some((ext) => name.endsWith(ext));
    if (!isAllowedType) {
      setError('Unsupported file type. Please upload a Word, PDF, PowerPoint, or .txt file.');
      setFile(null);
      setFileName('');
      event.target.value = ''; // reset so the same file can be re-picked later
      return;
    }

    // Check the file size.
    if (selected.size > maxSizeBytes) {
      setError('That file is too large. Please upload a file smaller than 40 MB.');
      setFile(null);
      setFileName('');
      event.target.value = '';
      return;
    }

    setFile(selected); // keep the File so we can upload it on Generate
    setFileName(selected.name); // remember the name so Generate is enabled / shown
    setError(''); // clear any previous error
  }

  return (
    <main className="container">
        <header className="header">
          <h1>Study Helper</h1>
          <div className="cajita">
            <FaRobot className ="icon"/>
            <p className="subtitle">
                : Paste or upload your course notes and I will generate a
                summary, key concepts, and practice questions to help you study!
            </p>
          </div>
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
