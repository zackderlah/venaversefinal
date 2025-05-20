# MVP Feature Tasks Checklist

## 1. User Authentication
- [x] Implement user login and session management (NextAuth or custom)
- [x] Restrict access to certain pages for unauthenticated users

## 2. User Profiles
- [x] Display user profile information
- [x] Show user's reviews and currently experiencing items

## 3. Reviews System
- [x] Create review form (title, category/type, creator, year, rating, review)
- [x] Autofill/search for media and creators (OMDb, AniList, iTunes, Google Books)
- [x] Submit review and save to database (Prisma/Postgres)
- [x] Display reviews on relevant pages
- [x] Edit own reviews
- [x] Delete own reviews
- [ ] Make the review field optional when creating or editing a review
- [ ] Show 'my [category] reviews' by default when navigating to a category page
- [x] Display comment counter on review cards (home, category, and profile pages)

## 4. Currently Experiencing Section
- [x] Add "currently experiencing" form (type, title, creator, year, seasons, progress)
- [x] Autofill/search for media and creators (same as reviews)
- [x] Display currently experiencing items on profile
- [x] Delete currently experiencing items

## 5. Search/Autofill Improvements
- [x] Implement dropdown suggestions for media and creators
- [x] Loosen filtering to show all API results, not just strict matches
- [x] Support keyboard navigation in dropdowns

## 6. UI/UX
- [x] Responsive and modern UI for forms and lists
- [x] Show loading and error states
- [x] Show confirmation dialogs for destructive actions (delete)

## 7. API & Database
- [x] Set up Prisma models for users, reviews, currently experiencing
- [x] Implement API routes for CRUD operations
- [x] Sync database schema

## 8. Miscellaneous
- [x] Add validation for form fields (e.g., year, rating)
- [x] Redirect after successful actions (e.g., after creating a review)
- [x] Handle edge cases (e.g., no results, API errors)

## 9. Background Cycling
- [ ] Allow users to cycle through all wallpapers in the public folder starting with "bg" using left/right arrow keys, and persist the selected background across refreshes and navigation
