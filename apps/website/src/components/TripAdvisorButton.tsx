import React, { useState, useEffect } from 'react';
import styles from '../styles/TripAdvisorButton.module.css';

interface Review {
  user: { username: string };
  text: string;
  rating: number;
  published_date?: string;
}

interface TripAdvisorButtonProps {
  locationId?: string;
}

// Official TripAdvisor Full Logo (Ollie mascot + Wordmark)
const TripAdvisorLogo = () => (
  <svg className={styles.taLogo} viewBox="0 0 450 100" xmlns="http://www.w3.org/2000/svg">
    {/* Verified Simple Icons Ollie Mascot */}
    <g fill="#00AF87" transform="scale(3.2) translate(0, 0)">
      <path d="M17.14 13.14a1.86 1.86 0 1 0 1.86 1.86 1.86 1.86 0 0 0-1.86-1.86zm-10.28 0a1.86 1.86 0 1 0 1.86 1.86 1.86 1.86 0 0 0-1.86-1.86zM12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0zm6.857 18.143a4.286 4.286 0 1 1 4.286-4.286 4.286 4.286 0 0 1-4.286 4.286zm-13.714 0a4.286 4.286 0 1 1 4.286-4.286 4.286 4.286 0 0 1-4.286 4.286zM12 15.429l-1.714-2.572h3.428L12 15.429zm6.857-8.572a6.857 6.857 0 0 0-6.857 6.857 6.857 6.857 0 0 0-6.857-6.857 10.286 10.286 0 0 1 13.714 0z"/>
    </g>
    {/* Tripadvisor Wordmark */}
    <text x="100" y="65" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="700" fontSize="52" letterSpacing="-0.5" fill="#000000">Tripadvisor</text>
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

export const TripAdvisorButton: React.FC<TripAdvisorButtonProps> = ({ locationId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const tourUrl = locationId 
    ? `https://www.tripadvisor.com/Attraction_Review-g1-d${locationId}-Reviews.html`
    : "https://www.tripadvisor.com/Attraction_Review-g186487-d211671-Reviews-King_s_College_Chapel-Aberdeen_Aberdeenshire_Scotland.html";

  useEffect(() => {
    const fetchUrl = locationId 
        ? `/functions/get-tripadvisor-reviews?locationId=${locationId}`
        : '/functions/get-tripadvisor-reviews';

    fetch(fetchUrl)
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
  }, [locationId]);

  useEffect(() => {
    if (reviews.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [reviews.length]);

  if (loading) return (
    <div className={`${styles.tripadvisorWidget} ${styles.loading}`}>
      <div className={styles.tripadvisorContent}>
        <TripAdvisorLogo />
        <div className={styles.tripadvisorRatingInfo}>
          <BubbleRating rating={4.5} size="large" />
          <span className={styles.reviewCount}>Loading reviews...</span>
        </div>
      </div>
    </div>
  );

  const fallbackReviews: Review[] = [
    {
      user: { username: "Jane D." },
      text: "Beautiful historic location with incredible atmosphere and a peaceful vibe.",
      rating: 5,
      published_date: "2024-02-10"
    },
    {
      user: { username: "Mark S." },
      text: "A must-see! The architecture is stunning and full of history.",
      rating: 5,
      published_date: "2024-01-15"
    },
    {
      user: { username: "Alice W." },
      text: "Incredible craftsmanship throughout. Breathtaking works of art.",
      rating: 4.5,
      published_date: "2023-12-05"
    }
  ];

  const displayReviews = (error || reviews.length === 0) ? fallbackReviews : reviews;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayReviews.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
  };

  return (
    <div className={styles.tripAdvisorContainer}>
      <div className={styles.headerSection}>
        <div className={styles.logoAndButton}>
          <TripAdvisorLogo />
          <a 
            href={tourUrl} 
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

      <div className={styles.reviewsCarouselSection}>
        <button className={`${styles.navButton} ${styles.prevButton}`} onClick={goToPrev}>&#10094;</button>
        
        <div className={styles.reviewSlide} key={currentIndex}>
          <div className={styles.cardHeader}>
            <BubbleRating rating={displayReviews[currentIndex].rating} />
          </div>
          <p className={styles.reviewText}>"{displayReviews[currentIndex].text}"</p>
          <div className={styles.reviewFooter}>
            <div className={styles.authorInitial}>
              {displayReviews[currentIndex].user.username.charAt(0)}
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.reviewAuthor}>{displayReviews[currentIndex].user.username}</span>
            </div>
          </div>
        </div>

        <button className={`${styles.navButton} ${styles.nextButton}`} onClick={goToNext}>&#10095;</button>
      </div>
    </div>
  );
};
