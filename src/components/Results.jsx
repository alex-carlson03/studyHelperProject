import Keywords from './Keywords';
import Questions from './Questions';
import {FaRobot, FaScroll, FaClipboardList, FaQuestion, FaBug} from 'react-icons/fa' ;


// Results shows the three output cards. It receives the whole results object
// as a prop and hands the arrays down to the list components.
function Results({ results }) {
  return (
    <section className="results">
      {/* 1. Summary */}
      <div className="card">
        <div className="oingo">
            <FaRobot className ="boingo"/>
            <FaScroll className ="boingo"/>
            <h2>Summary</h2>
        </div>
        <p>{results.summary}</p>
      </div>

      {/* 2. Keywords */}
      <div className="card">
        <div className='oingo'>
          <FaRobot className ="boingo"/>
          <FaClipboardList className="boingo"/>
          <h2>Keywords</h2>
        </div>
        <Keywords keywords={results.keywords} />
      </div>

      {/* 3. Practice Questions */}
      <div className="card">
        <div className="oingo">
           <FaRobot className ="boingo"/>
           <FaQuestion className="boingo"/>
          <h2>Practice Questions</h2>
        </div>
        <Questions questions={results.questions} />
      </div>
    </section>
  );
}

export default Results;
