// displays the inputs and calls the functions that Home passed down as props. It holds no state of its own.
function NoteInput({ notes, onNotesChange, onFileChange, onGenerate, fileName, error, loading }) {
  return (
    <section className="card input-card">
      {/* Large textarea for student notes. I didn't include any safeguards for SQL injection or anything like that since it is a basic demo. but just so you know */}
      <label htmlFor="notes" className="label">
        Your notes
      </label>
      <textarea
        id="notes"
        className="textarea"
        placeholder="Paste your course notes here..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={10}
      />


      {/* placeholder for file upload */}
      <label htmlFor="file" className="label">
        Or upload a notes file
      </label>
      <input
        id="file"
        className="file-input"
        type="file"
        accept=".doc,.docx,.pdf,.ppt,.pptx,.txt"
        onChange={onFileChange}
      />

      {/* Confirms which file was picked up. */}
      {fileName && <p className="file-name">Selected file: {fileName}</p>}

      {/* Generate button. Disabled while loading to avoid issues */}
      <button className="button" onClick={onGenerate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Study Guide'}
      </button>

      {/* Error message only shows when error is not empty. */}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default NoteInput;
