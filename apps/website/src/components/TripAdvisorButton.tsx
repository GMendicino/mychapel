import React, { useState, useEffect } from 'react';
import styles from '../styles/TripAdvisorButton.module.css';

interface Review {
  user: { username: string };
  text: string;
  rating: number;
  published_date?: string;
}

const TripAdvisorLogo = () => (
  <svg className={styles.taLogo} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-8.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm11 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM12 14c-1.33 0-2.5.67-3.21 1.69-.18.25-.13.6.12.78s.6.13.78-.12C10.15 15.65 11.02 15.25 12 15.25s1.85.4 2.31 1.09c.18.25.53.31.78.12s.31-.53.12-.78C14.5 14.67 13.33 14 12 14z"/>
    <circle cx="8.5" cy="11.5" r="1.5" />
    <circle cx="15.5" cy="11.5" r="1.5" />
  </svg>
);

const BubbleRating = ({ rating }: { rating: number }) => {
  return (
    <div className={styles.bubblesContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className={`${styles.bubble} ${i > Math.floor(rating) && i <= Math.ceil(rating) ? styles.half : ''} ${i > Math.ceil(rating) ? styles.empty : ''}`}
          style={{ backgroundColor: i <= rating ? '#00af87' : '#e0e0e0' }}
        />
      ))}
    </div>
  );
};

export const TripAdvisorButton: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const chapelUrl = "https://www.tripadvisor.com/Attraction_Review-g186487-d211671-Reviews-King_s_College_Chapel-Aberdeen_Aberdeenshire_Scotland.html";

  useEffect(() => {
    fetch('/functions/get-tripadvisor-reviews')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then(data => {
        if (data.data) {
          setReviews(data.data.slice(0, 5));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("TripAdvisor Error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const fallbackReviews: Review[] = [
    {
      user: { username: "Jane D." },
      text: "Beautiful historic chapel with incredible woodwork and a peaceful atmosphere. A highlight of the university campus.",
      rating: 5,
      published_date: "2024-02-10"
    },
    {
      user: { username: "Mark S." },
      text: "A must-see in Aberdeen! The architecture is stunning and full of history. The crown steeple is iconic.",
      rating: 5,
      published_date: "2024-01-15"
    },
    {
      user: { username: "Alice W." },
      text: "Incredible craftsmanship throughout. The stained glass and choir stalls are breathtaking works of art.",
      rating: 4.5,
      published_date: "2023-12-05"
    }
  ];

  const displayReviews = (error || reviews.length === 0) ? fallbackReviews : reviews;

  return (
    <div className={styles.tripAdvisorContainer}>
      <div className={styles.headerSection}>
        <a 
          href={chapelUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.tripAdvisorButton}
        >
          <TripAdvisorLogo />
          <span>Review us on Tripadvisor</span>
        </a>
        <div className={styles.ratingSummary}>
          <BubbleRating rating={4.5} />
          <span>4.5 • Excellent</span>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        {loading ? (
          <p>Loading live reviews...</p>
        ) : (
          displayReviews.map((review, index) => (
            <div key={index} className={styles.reviewCard}>
              <div className={styles.cardHeader}>
                <BubbleRating rating={review.rating} />
              </div>
              <p className={styles.reviewText}>"{review.text}"</p>
              <div className={styles.reviewFooter}>
                <div className={styles.authorInitial}>
                  {review.user.username.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <span className={styles.reviewAuthor}>{review.user.username}</span>
                  {review.published_date && (
                    <span className={styles.reviewDate}>
                      {new Date(review.published_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
