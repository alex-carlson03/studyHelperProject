// Keywords renders the list of key concepts as little "pill" tags.
// .map() turns each string in the array into an <li>. Every list item needs a
// unique "key" prop so React can track them efficiently.
function Keywords({ keywords }) {
  return (
    <ul className="keyword-list">
      {keywords.map((keyword, index) => (
        <li key={index} className="keyword-pill">
          {keyword}
        </li>
      ))}
    </ul>
  );
}

export default Keywords;
