import React, { useState, useEffect } from "react";
import "../styles/carousel.css"; 

interface CarouselProps {
  images: string[];
  interval?: number;
  style?: React.CSSProperties;
}

export const Carousel: React.FC<CarouselProps> = ({ images, interval = 3000, style }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container" style={style}>
      <button onClick={goToPrevious} className="nav-button left">
        &#10094;
      </button>
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        className="carousel-image"
      />
      <button onClick={goToNext} className="nav-button right">
        &#10095;
      </button>
    </div>
  );
};