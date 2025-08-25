import React from "react";

interface HeroProps {
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  description,
  children,
  backgroundImage = "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1500&q=80')",
}) => (
  <div
    className="flex flex-col items-center justify-center flex-1 w-full min-h-[70vh] pt-32"
    style={{
      backgroundImage,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="bg-white/80 rounded-xl p-10 shadow-lg flex flex-col items-center">
      {children}
      <h1 className="text-5xl font-extrabold text-main-purple mb-6 drop-shadow-lg text-center">
        {title}
      </h1>
      <p className="text-xl text-gray-700 max-w-xl mb-8 text-center">
        {description}
      </p>
    </div>
  </div>
);

export default Hero;
