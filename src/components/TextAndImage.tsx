import React from "react";
import Image from "next/image";
import Button from "./ui/Button/Button";

interface TextAndImageProps {
  heading: string;
  text: React.ReactNode;
  buttonText?: string;
  imageSrc: string;
  imageAlt: string;
  imageLeft?: boolean;
  className?: string;
}

const TextAndImage: React.FC<TextAndImageProps> = ({
  heading,
  text,
  buttonText,
  imageSrc,
  imageAlt,
  imageLeft = false,
  className = "",
}) => (
  <div
    className={`flex flex-col md:flex-row w-full h-[600px] md:h-[500px] bg-transparent ${className}`}
    style={{ minHeight: 400 }}
  >
    {/* Text Section */}
    {/* Image Section */}
    <div
      className={`relative md:w-1/2 w-full h-64 md:h-auto ${
        imageLeft ? "order-1 md:order-1" : "order-1 md:order-2"
      }`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover w-full h-full"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
    {/* Text Section */}
    <div
      className={`flex flex-col justify-center px-8 py-12 md:w-1/2 w-full ${
        imageLeft ? "order-2 md:order-2" : "order-2 md:order-1"
      } bg-white`}
    >
      <div className="max-w-xl mx-auto">
        <h2 className="text-main-purple text-3xl md:text-4xl font-bold mb-2">
          {heading}
        </h2>
        <div className="w-24 h-0.5 bg-light-gray mb-6" />
        <div className="text-gray-800 text-base md:text-lg mb-8">{text}</div>
        {buttonText && (
          <div>
            <Button variant="primary-l">
              {buttonText} <span className="ml-2">&rsaquo;</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default TextAndImage;
