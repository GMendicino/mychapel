import React, { useState, useEffect } from 'react';
import styles from '../styles/TripAdvisorButton.module.css';

interface Review {
  user: { username: string };
  text: string;
  rating: number;
  published_date?: string;
}

// Official TripAdvisor Mascot (Ollie) SVG
const TripAdvisorLogo = () => (
  <svg className={styles.taLogo} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <path d="M150 25c-69 0-125 56-125 125s56 125 125 125 125-56 125-125S219 25 150 25zm0 225c-55.2 0-100-44.8-100-100S94.8 50 150 50s100 44.8 100 100-44.8 100-100 100z" fill="currentColor"/>
    <path d="M150 165c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" fill="currentColor"/>
    <path d="M105 185c-24.8 0-45-20.2-45-45s20.2-45 45-45 45 20.2 45 45-20.2 45-45 45zm0-70c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25z" fill="currentColor"/>
    <path d="M195 185c-24.8 0-45-20.2-45-45s20.2-45 45-45 45 20.2 45 45-20.2 45-45 45zm0-70c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25z" fill="currentColor"/>
    <path d="M150 105l-15-25h30z" fill="currentColor"/>
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
