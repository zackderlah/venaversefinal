import Link from 'next/link'
import { reviews } from '@/data/reviews'
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'

export default function Home() {
  // Sort reviews by date and get the 4 most recent
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-16 px-4 py-8 max-w-[1000px] mx-auto border-x-2 border-black dark:border-gray-100 min-h-screen">
      <section className="border-b-2 border-black dark:border-gray-100 pb-8">
        <h2 className="text-4xl font-black mb-4 tracking-tight lowercase">note</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed lowercase">
          this website is merely a personal collection of reviews for films, music, anime, and books that i've experienced.
          each review includes my thoughts, ratings, and analysis of the work. i am not a good writer.
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-12 border-b-2 border-black dark:border-gray-100 pb-4">
          <h2 className="text-4xl font-black tracking-tight lowercase">recent reviews</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {recentReviews.map((review) => (
            <div key={review.id} className="flex flex-col h-full">
              <ReviewLink review={review}>
                <ReviewCard review={review} />
              </ReviewLink>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 