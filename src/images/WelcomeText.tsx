import React from "react";

const WelcomeText: React.FC = () => (
  <svg
    width="320"
    height="60"
    viewBox="0 0 320 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto my-8"
  >
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="var(--font-jakarta-sans), ui-sans-serif, system-ui"
      fontSize="32"
      fontWeight="bold"
      fill="#635FC7"
      className="dark:fill-light-gray"
    >
      Welcome to Kanban
    </text>
  </svg>
);

export default WelcomeText;
