# Epic 8: Reviews & Trust Badges

## 1. Goal
Build the feedback loop that generates trust in the marketplace. Clients can only review providers they have actually contacted, ensuring all reviews are from verified transactions.

## 2. In Scope
*   `UI/UX`: "Leave a Review" button on the Client's past leads dashboard.
*   `UI/UX`: Review submission form (1-5 stars, text comment).
*   `Logic`: Enforcement that a review can only be left if a `lead` exists between the Client and Provider.
*   `Data Aggregation`: Updating the Provider's overall rating based on new reviews.

## 3. Out of Scope
*   Provider ability to publicly reply to reviews (MVP simplification).
*   Complex dispute resolution UI (handled manually by Admin in Epic 9).

## 4. Technical Requirements
*   **Server Action:** `submitReview(leadId, rating, comment)`
*   **Validation:** 
    *   Verify the user executing the action owns the `lead_id`.
    *   Verify a review doesn't already exist for this `lead_id`.
*   **Aggregation Strategy:** Create a database trigger on the `reviews` table. When a new review is inserted, the trigger calculates the new average rating for that provider and updates the `rating` column on the `providers` table.

## 5. Acceptance Criteria
1.  A Client views their lead history. For leads older than X days (or marked 'closed'), they see a "Leave Review" button.
2.  Submitting a 4-star review successfully inserts a row into the `reviews` table.
3.  The Provider's aggregate rating on their public profile instantly reflects the new score.
4.  If the Client tries to submit a second review for the exact same lead, the system blocks it.
