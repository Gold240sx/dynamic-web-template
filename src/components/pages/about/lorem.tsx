import type React from "react";

interface LoremProps {
  paragraphs?: number;
  sentences?: number;
}

export const Lorem: React.FC<LoremProps> = ({
  paragraphs = 1,
  sentences = 5,
}) => {
  const loremText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const generateParagraph = () => {
    const sentences = loremText.split(".");
    const shuffled = sentences.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, sentences.length).join(". ") + ".";
  };

  return (
    <>
      {Array.from({ length: paragraphs }).map((_, index) => (
        <p key={index} className="mb-4">
          {generateParagraph()}
        </p>
      ))}
    </>
  );
};
