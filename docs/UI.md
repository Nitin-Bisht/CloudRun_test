# UI/UX Specifications

## 1. Design System
- **Font:** Inter (Google Fonts).
- **Colors:** 
  - Primary: Blue-600 (Trust, Professional).
  - Background: Slate-50.
  - Text: Slate-900.
  - Success: Green-600 (Verified).
  - Warning: Amber-500 (Pending).
- **Components:** Use shadcn/ui for Buttons, Cards, Inputs, Dialogs, Tables.

## 2. Key Pages & Layouts

### A. Homepage (`/`)
- **Hero:** Headline, Subhead, Country Search Dropdown + "Search" Button.
- **Features:** 3-column grid (Search, Compare, Connect).
- **Countries:** Grid of country cards (Flag, Name, Avg Cost).
- **Footer:** Links + Legal Disclaimer (Mandatory).

### B. Country Page (`/countries/[code]`)
- **Header:** Country Name, Flag, Stats (Cost, Timeline).
- **Tabs:** "Requirements" (Static Content) | "Providers" (List).
- **Provider List:** Filterable cards (Rating, Price, Verification Badge).

### C. Provider Profile (`/providers/[id]`)
- **Header:** Company Name, Verification Badge, Rating.
- **Content:** Bio, Services List, Reviews.
- **Sticky CTA:** "Contact Provider" (Checks credits → Opens Modal → Spend Credit).

### D. Dashboard (`/dashboard`)
- **Client View:** Credit Balance, Contact History.
- **Provider View:** Lead Inbox, Profile Edit, Verification Status.
- **Admin View:** Provider Approval Queue, Country CMS.

## 3. Responsive Behavior
- Mobile: Hamburger menu, stacked cards, simplified tables.
- Desktop: Full navigation, grid layouts, sidebars.