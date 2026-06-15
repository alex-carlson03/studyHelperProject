import Keywords from './Keywords';
import Questions from './Questions';

// Results shows the three output cards. It receives the whole results object
// as a prop and hands the arrays down to the list components.
function Results({ results }) {
  return (
    <section className="results">
      {/* 1. Summary */}
      <div className="card">
        <h2>Summary</h2>
        <p>{results.summary}</p>
      </div>

      {/* 2. Keywords */}
      <div className="card">
        <h2>Keywords</h2>
        <Keywords keywords={results.keywords} />
      </div>

      {/* 3. Practice Questions */}
      <div className="card">
        <h2>Practice Questions</h2>
        <Questions questions={results.questions} />
      </div>
    </section>
  );
}

export default Results;
