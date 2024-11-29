import React from "react";

const HighlightText = ({text}) => { // HighlightText component is a
  // functional component that takes a prop text and returns
  // a span element with a gradient text effect.
  return (
    <span className="bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-transparent bg-clip-text font-bold">
      {" "}
      {text}
    </span>
  );
};

export default HighlightText;