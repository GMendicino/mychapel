import React, { useState, useEffect } from 'react';
import './TripAdvisorWidget.css';

interface TripAdvisorData {
  rating?: string;
  num_reviews?: string;
  web_url?: string;
  rating_image_url?: string;
  name?: string;
  error?: string;
}

interface TripAdvisorWidgetProps {
  locationId: string;
}

const TripAdvisorWidget: React.FC<TripAdvisorWidgetProps> = ({ locationId }) => {
  // Use mock data as the initial state for testing visibility
  const [data, setData] = useState<TripAdvisorData | null>({
    rating: "4.5",
    num_reviews: "200",
    web_url: "https://www.tripadvisor.com/Attraction_Review-g186487-d1066004-Reviews-King_s_College_Chapel-Aberdeen_Aberdeenshire_Scotland.html",
    rating_image_url: "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/4.5-66827-5.svg",
    name: "King's College Chapel"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/get-tripadvisor-data?locationId=${locationId}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch TripAdvisor data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (locationId) {
      fetchData();
    }
  }, [locationId]);

  if (loading && !data) return (
    <div className="tripadvisor-widget loading">
      <div className="tripadvisor-content">
        <img 
          src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" 
          alt="TripAdvisor" 
          className="tripadvisor-logo"
        />
        <div className="tripadvisor-rating-info">
          <img src="https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/4.5-66827-5.svg" alt="4.5 stars" className="rating-stars" />
          <span className="review-count">Loading reviews...</span>
        </div>
      </div>
    </div>
  );

  // If there's an error or no data, still show the logo and a link to the reviews page
  const displayRating = data && !data.error;
  const webUrl = data?.web_url || `https://www.tripadvisor.com/Attraction_Review-g186487-d211671-Reviews-King_s_College_Chapel-Aberdeen_Aberdeenshire_Scotland.html`;

  return (
    <a 
      href={webUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="tripadvisor-widget"
      title={data?.name ? `View ${data.name} on TripAdvisor` : "View on TripAdvisor"}
    >
      <div className="tripadvisor-content">
        <img 
          src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg" 
          alt="TripAdvisor" 
          className="tripadvisor-logo"
        />
        <div className="tripadvisor-rating-info">
          {displayRating && data?.rating_image_url ? (
            <>
              <img src={data.rating_image_url} alt={`${data.rating} stars`} className="rating-stars" />
              <div className="rating-details">
                <span className="rating-score">{data.rating} / 5</span>
                <span className="review-count">({data.num_reviews} reviews)</span>
              </div>
            </>
          ) : (
            <span className="review-count">Click to view reviews</span>
          )}
        </div>
      </div>
    </a>
  );
};

export default TripAdvisorWidget;
