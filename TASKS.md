# MVP Feature Tasks Checklist

## 1. User Authentication
- [x] Implement user login and session management (NextAuth or custom)
- [x] Restrict access to certain pages for unauthenticated users

## 2. User Profiles
- [x] Display user profile information
- [x] Show user's reviews and currently experiencing items
- [x] Add profile image support with Next.js Image component
- [x] Update API to include profile image in user data
- [x] Improved title selection modal headers and styling
- [x] Added 'add title' placeholder and improved title alignment in profile header

## 3. Reviews System
- [x] Create review form (title, category/type, creator, year, rating, review)
- [x] Autofill/search for media and creators (OMDb, AniList, iTunes, Google Books)
- [x] Submit review and save to database (Prisma/Postgres)
- [x] Display reviews on relevant pages
- [x] Edit own reviews
- [x] Delete own reviews
- [x] Make the review field optional when creating or editing a review
- [x] Show 'my [category] reviews' by default when navigating to a category page
- [x] Display comment counter on review cards (home, category, and profile pages)
- [x] Add clickable review counter on profile card linking to user's reviews page
- [x] Implement API route to fetch all reviews for a given user
- [x] Review cards and displays: card is clickable, but edit/delete buttons do not trigger navigation
- [x] Edit/delete buttons and modal added to individual review page, with correct client-side session logic
- [x] Fixed userId type mismatch in edit/delete permissions
- [x] Themed confirmation modals for destructive actions (delete review, etc.)

## 4. Currently Experiencing Section
- [x] Add "currently experiencing" form (type, title, creator, year, seasons, progress)
- [x] Autofill/search for media and creators (same as reviews)
- [x] Display currently experiencing items on profile
- [x] Delete currently experiencing items
- [x] Reorder form fields for better UX
- [x] Themed confirmation modals for destructive actions (delete currently experiencing item)

## 5. Search/Autofill Improvements
- [x] Implement dropdown suggestions for media and creators
- [x] Loosen filtering to show all API results, not just strict matches
- [x] Support keyboard navigation in dropdowns
- [x] Update music search to include both albums and individual songs
- [x] Implement case-insensitive and partial matching for all media types

## 6. UI/UX
- [x] Responsive and modern UI for forms and lists
- [x] Show loading and error states
- [x] Show confirmation dialogs for destructive actions (delete)
- [x] Add user profile pictures in comment section
- [x] Make usernames and profile pictures in comments clickable
- [x] Review cards and displays: card is clickable, but edit/delete buttons do not trigger navigation
- [x] Improved comment section post button UI and positioning
- [x] Improved title selection modal headers and styling
- [x] Added 'add title' placeholder and improved title alignment in profile header
- [x] General UI/UX polish for all the above
- [x] Added review counter to category pages
- [x] Improved spacing and layout of category pages

## 7. API & Database
- [x] Set up Prisma models for users, reviews, currently experiencing
- [x] Implement API routes for CRUD operations
- [x] Sync database schema
- [x] Update API routes to include profile images and comment counts

## 8. Miscellaneous
- [x] Add validation for form fields (e.g., year, rating)
- [x] Redirect after successful actions (e.g., after creating a review)
- [x] Handle edge cases (e.g., no results, API errors)
- [x] Update Next.js image domains for profile pictures

## 9. Background Cycling
- [x] Allow users to cycle through all wallpapers in the public folder starting with "bg" using left/right arrow keys
- [x] Persist the selected background across refreshes and navigation
- [x] Add and update background images in public folder
- [x] Remove background transition animations based on user feedback
- [x] Ensure background images list matches actual files in public folder

## 10. Deployment & Version Control
- [x] Set up deployment pipeline
- [x] Implement proper commit and push workflow
- [x] Handle cache clearing for deployed changes
- [x] Monitor deployment status and troubleshoot issues
