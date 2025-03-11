"use client";

import { useEffect } from "react";

interface ScrollArrowProps {
  targetRef: React.RefObject<HTMLElement>;
}

const ScrollArrow: React.FC<ScrollArrowProps> = ({ targetRef }) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes mouse-wheel {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(6px); opacity: 0; }
      }
      @keyframes mouse-scroll {
        0% { opacity: 0; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleClick = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-[100px] w-6">
        <div className="border-secondary-foreground mb-2 h-[42px] w-6 rounded-full border-2">
          <div className="bg-secondary-foreground mx-auto mt-[5px] h-1 w-1 animate-[mouse-wheel_0.6s_linear_infinite] rounded-full"></div>
        </div>
        <div>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="border-secondary-foreground mb-[-6px] ml-1 block h-4 w-4 rotate-45 animate-[mouse-scroll_1s_infinite] border-b-2 border-r-2"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollArrow;
