import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(price)
    .replace("₫", "đ");
};

const ComicCard = ({ comic }) => {
  const {
    title,
    slug,
    author,
    price,
    discount = 0,
    images = [],
    isNew,
    isBestSeller,
    rating,
    tags = [],
  } = comic;

  const discountedPrice = price * (1 - discount / 100);
  const coverImage = images[0] || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60";

  return (
    <div className="comic-card animate-fade-in">
      <Link to={`/comic/${slug}`} className="comic-card-link">
        <div className="comic-image-container">
          <img src={coverImage} alt={title} loading="lazy" />
          {discount > 0 && <span className="comic-badge discount-badge">-{discount}%</span>}
          {!discount && isNew && <span className="comic-badge new-badge">MỚI</span>}
          {!discount && !isNew && isBestSeller && <span className="comic-badge hot-badge">BÁN CHẠY</span>}
        </div>
      </Link>

      <div className="comic-card-info">
        <span className="comic-card-author">{author}</span>
        
        <Link to={`/comic/${slug}`} className="comic-card-title-link">
          <h4 className="comic-card-title">{title}</h4>
        </Link>

        {rating && rating.avg > 0 && (
          <div className="comic-card-rating">
            <Star size={12} fill="var(--color-accent)" color="var(--color-accent)" />
            <span>{rating.avg}</span>
            <span className="rating-count">({rating.count})</span>
          </div>
        )}

        <div className="comic-card-price-section">
          {discount > 0 ? (
            <>
              <span className="current-price">{formatPrice(discountedPrice)}</span>
              <span className="original-price">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="current-price">{formatPrice(price)}</span>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="comic-card-tags">
            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="tag-badge">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .comic-card-link {
          display: block;
          position: relative;
        }
        .comic-card-title-link {
          display: block;
        }
        .discount-badge {
          background-color: #6C3D2F !important;
          color: white !important;
          border-color: #6C3D2F !important;
        }
        .new-badge {
          background-color: #ECE5DC !important;
          color: var(--color-accent) !important;
          font-weight: 700;
        }
        .hot-badge {
          background-color: #2A2421 !important;
          color: white !important;
        }
        .comic-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
        .rating-count {
          font-size: 0.7rem;
          opacity: 0.75;
        }
        .comic-card-price-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }
        .current-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-accent);
        }
        .original-price {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-decoration: line-through;
          opacity: 0.7;
        }
      `}} />
    </div>
  );
};

export default ComicCard;
