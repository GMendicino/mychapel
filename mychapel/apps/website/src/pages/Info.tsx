import React, { useState, useEffect } from 'react';
import { Carousel } from '../components/Carousel';
import "../styles/info.css";
import { Footer } from '../components/Footer';
import { Link, useParams } from "react-router-dom";
import { getPublishedTour, type Project } from '../script/storage';

export const Info: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPublishedTour(id).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="info-container"><p>Loading tour...</p></div>;
  if (!project) return <div className="info-container"><p>Tour not found.</p></div>;

  const { tour } = project;
  const slideshowImages = tour.mainPage.slideShowImages && tour.mainPage.slideShowImages.length > 0
    ? tour.mainPage.slideShowImages
    : [tour.mainPage.logo || "/images/temporaryIcon.png"];

  return (
    <div className="info-container">
      <Carousel images={slideshowImages} interval={5000} />

      <div className="Start-Tour">
        <Link to={`/panorama/${id}`} className="Start-Tour-Button">
          Tour Start
          <img src="/images/eye.png" alt="Eye Icon" className="eye-icon" />
        </Link>
      </div>

      <div className="two-column-section">
        <div className="column">
          <h2>{tour.mainPage.introduction || tour.mainPage.title}</h2>
          <p>{tour.mainPage.description || "Explore this virtual tour."}</p>
        </div>
      </div>

      {tour.mainPage.Highlights && tour.mainPage.Highlights.length > 0 && (
        <div className="services-container">
          <h2 className="highlights-section-title">Highlights</h2>
          {tour.mainPage.Highlights.map(([imageSrc, title, description], i) => (
            <div key={i} className="service-item highlights-service-item">
              {imageSrc && <img src={imageSrc} alt={title} className="service-icon" />}
              <h3>{title}</h3>
              <p className="highlights-description">{description}</p>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}