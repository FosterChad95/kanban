import React from "react";
import Image from "next/image";

interface TextAndImageProps {
  text: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imageLeft?: boolean;
  className?: string;
}

const TextAndImage: React.FC<TextAndImageProps> = ({
  text,
  imageSrc,
  imageAlt,
  imageLeft = false,
  className = "",
}) => (
  <div
    className={`flex flex-col md:flex-row items-center gap-6 my-8 ${className}`}
  >
    {imageLeft && (
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={320}
        height={192}
        className="w-80 h-48 object-cover rounded shadow"
        priority
      />
    )}
    <div className="flex-1 text-center md:text-left text-gray-800 text-lg">
      {text}
    </div>
    {!imageLeft && (
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={320}
        height={192}
        className="w-80 h-48 object-cover rounded shadow"
        priority
      />
    )}
  </div>
);

export default TextAndImage;
