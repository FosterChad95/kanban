import React from "react";

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className = "" }) => (
  <img src={src} alt={alt} className={`rounded shadow ${className}`} />
);

export default Image;
