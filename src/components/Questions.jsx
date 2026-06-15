function Questions({ questions }) {
  return (
    <ol className="question-list">
      {questions.map((question, index) => (
        <li key={index}>{question}</li>
      ))}
    </ol>
  );
}

export default Questions;
