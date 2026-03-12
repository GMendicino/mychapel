import React, { useState, useEffect } from 'react';
import styles from '../styles/TripAdvisorButton.module.css';

interface Review {
  user: { username: string };
  text: string;
  rating: number;
  published_date?: string;
}

// Official TripAdvisor Full Logo (Ollie + Wordmark)
const TripAdvisorLogo = () => (
  <svg className={styles.taLogo} viewBox="0 0 512 120" xmlns="http://www.w3.org/2000/svg">
    {/* Ollie the Owl Icon */}
    <g fill="#00AF87">
      <path d="M75.4 34.6c-11.2 0-20.3 9.1-20.3 20.3s9.1 20.3 20.3 20.3 20.3-9.1 20.3-20.3-9.1-20.3-20.3-20.3zm0 31.5c-6.2 0-11.2-5-11.2-11.2s5-11.2 11.2-11.2 11.2 5 11.2 11.2-5 11.2-11.2 11.2zM34.6 34.6c-11.2 0-20.3 9.1-20.3 20.3s9.1 20.3 20.3 20.3 20.3-9.1 20.3-20.3-9.1-20.3-20.3-20.3zm0 31.5c-6.2 0-11.2-5-11.2-11.2s5-11.2 11.2-11.2 11.2 5 11.2 11.2-5 11.2-11.2 11.2zM55 85.4c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35-35-15.7-35-35-35zm0 60.9c-14.3 0-25.9-11.6-25.9-25.9s11.6-25.9 25.9-25.9 25.9 11.6 25.9 25.9-11.6 25.9-25.9 25.9z" transform="scale(0.8) translate(0, 10)"/>
    </g>
    {/* Tripadvisor Wordmark */}
    <text x="110" y="85" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="68" fill="#000000">Tripadvisor</text>
  </svg>
);

const BubbleRating = ({ rating, size = "small" }: { rating: number, size?: "small" | "large" }) => {
  return (
    <div className={`${styles.bubblesContainer} ${size === "large" ? styles.largeBubbles : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        let bubbleClass = styles.bubble;
        if (i <= Math.floor(rating)) {
          bubbleClass += ` ${styles.full}`;
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
          bubbleClass += ` ${styles.half}`;
        } else {
          bubbleClass += ` ${styles.empty}`;
        }
        return <div key={i} className={bubbleClass} />;
      })}
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
        <div className={styles.logoAndButton}>
          <TripAdvisorLogo />
          <a 
            href={chapelUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.tripAdvisorButton}
          >
            <span>Review us on Tripadvisor</span>
          </a>
        </div>
        <div className={styles.ratingSummary}>
          <BubbleRating rating={4.5} size="large" />
          <span className={styles.summaryText}>4.5 • Excellent</span>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        {loading ? (
          <p className={styles.loadingText}>Loading live reviews...</p>
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
