"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import ReviewLink from "@/components/ReviewLink";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import { Review } from "@/types/review";

export default function UserReviewsPage() {
  const { username } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/user-reviews?username=${username}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      });
  }, [username]);

  const filteredReviews = reviews
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">all reviews by {username}</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="search reviews..." />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>
        {loading ? (
          <div className="text-gray-500 lowercase">loading...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-gray-400 lowercase">no reviews found</div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <ReviewLink key={review.id} review={review}>
                <ReviewCardDisplay review={review} />
              </ReviewLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 