import React, { CSSProperties} from 'react';
import { Carousel } from '../components/Carousel';
import "../styles/info.css";
import { Footer } from '../components/Footer';
import { Link } from "react-router-dom";
import TripAdvisorWidget from '../components/TripAdvisorWidget';

interface Service {
  title: string;
  content: string;
  icon: string;
}

export const Info: React.FC = () => {
  // Real ID for King's College Chapel
  const tripAdvisorId = "1066004"; 

  const tourSlideshowImages = [
  "/images/tourslideshow1.png",
  "/images/tourslideshow2.png",
  "/images/tourslideshow3.png"
  ];

const StartTour: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Link to={`/panorama?id=${id}`} className="Start-Tour-Button">
      Tour Start
      <img src="/images/eye.png" alt="Eye Icon" className="eye-icon" />
    </Link>
  );
};
  
/*
  THIS IS WHERE ADMIN INPUT CAN BE "PIPED" INTO
  */
const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTours() {
      try {
        const response = await fetch('/get-tours');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const mappedServices: Service[] = data.map((tour: any) => ({
            title: tour.title,
            content: tour.description,
            icon: tour.logo
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, []);

  const infoContainerStyle: CSSProperties = {
    position: 'relative'
  };

  if (loading) return <div>Loading published tours...</div>;

  /*
  THIS IS WHERE ADMIN INPUT CAN BE "PIPED" INTO
  */
  return (
    <div className="info-container" style={infoContainerStyle}>
        <Carousel images={tourSlideshowImages} interval={5000} />      <div className="Start-Tour">
        <StartTour id="1"/>
      </div>
      <div className="two-column-section">
        <div className="column">
          <h2>The King's College Chapel</h2>
          <p>
            Welcome to the King's Chapel, one of the oldest surviving buildings on our Aberdeen Campus founded in 1495 and began construction in 1500. We are happy to have you today and hope that you will enjoy exploring with our app. As you move around the chapel use your phone to look for areas highlighted by unique links to find out more.
          </p>
        </div>
      </div>  
       <div className="services-container">
        {services.map((service, i) => (
          <div key={i} className="service-item">
            <img
              src={service.icon}
              alt={service.title}
              className="service-icon"
            />
            <h3>{service.title}</h3>
            <p>{service.content}</p>
          </div>
        ))}
      </div> 
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <TripAdvisorWidget locationId={tripAdvisorId} />
      </div>
      <Footer /> 
    </div>
  );
}