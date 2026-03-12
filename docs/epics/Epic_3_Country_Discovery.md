# Epic 3: Country Content & Static Pages

## 1. Goal
Provide the educational foundation of the platform by displaying the active incorporation jurisdictions and their specific, JSON-driven requirements. Create an Admin interface to edit this JSON.

## 2. In Scope
*   `UI/UX`: Public `Countries` index page showing active jurisdictions.
*   `UI/UX`: Public `Country Detail` page parsing JSON requirements into a readable format.
*   `Supabase/Data`: Row Level Security allowing public read access to active countries.
*   `Admin UI`: Basic form to create/edit country records and manage the JSON `requirements` structure.

## 3. Out of Scope
*   Side-by-side country comparison tool (deferred to MVP polish or Phase 2).
*   Displaying providers on the country page (covered in Epic 5).

## 4. Technical Requirements
*   **Queries:** `getCountries()`, `getCountryByCode(code)`.
*   **Admin Server Action:** `upsertCountry(data)` to create or update a country.
*   **Data Structure:** The `requirements` column must adhere to the schema specified in `Content_Structure.md`.

## 5. Acceptance Criteria
1.  Public users can navigate to `/countries` and see a list of countries where `is_active` is true.
2.  Clicking a country routes to `/countries/[code]` and correctly renders the timelines, costs, and documents from the JSON.
3.  Admins can log in, navigate to `/admin/countries`, and edit the JSON data for a country.
4.  Updates made by an Admin are instantly visible on the public country detail page.
