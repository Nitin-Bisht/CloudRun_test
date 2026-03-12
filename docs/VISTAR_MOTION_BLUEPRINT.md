# VISTAR Motion Blueprint

## Goal
Build a high-trust, cinematic landing flow that combines:
- Farm Minerals: precise hero reveal and controlled scroll story
- VWLAB: oversized typography and framed motion language
- Unifiers of Japan: chapter rhythm and progress rails
- Superlocal: intentional color-scene shifts
- tinyPod: atmospheric product focus and quiet navigation

## Motion Principles
- One dominant motion event per section.
- Keep transitions smooth but measurable.
- Use chapter progression to orient users.
- Prioritize clarity over decorative movement.
- Honor `prefers-reduced-motion`.

## Section Order
1. Entry Gate
2. Hero Portal
3. Signal Marquee
4. Architecture Stack (3 chapter cards)
5. Jurisdiction Stage
6. Method Protocol
7. Conversion CTA

## Entry + Hero Spec
- Entry overlay: split curtain opens in ~1.15s after short logo hold.
- Hero text: staged fade and slight scale-in.
- Hero to panel transition: curved reveal panel rises and flattens.
- Side rails: vertical labels for narrative context.

## Timing and Easing Tokens
- `fast`: `0.3s`, `cubic-bezier(0.22, 1, 0.36, 1)`
- `base`: `0.7s`, `cubic-bezier(0.22, 1, 0.36, 1)`
- `slow`: `1.1s`, `cubic-bezier(0.16, 1, 0.3, 1)`
- `drift`: `3.8s`, `easeInOut` (looping ambient only)

## Color-Scene System
- `field`: dark green-black with soft organic glow
- `midnight`: deep blue-black with cyan signal glow
- `sand`: warm dark neutral with amber highlight

Use these scenes for stacked architecture cards to create controlled contrast.

## Typography Direction
- Sans: clean and modern for UI and body copy
- Display: compressed, bold, editorial for headlines
- Mono: utility labels and metadata

## Accessibility Rules
- Disable perpetual loops and large parallax under reduced-motion.
- Minimize transform travel distance in reduced-motion mode.
- Keep content order unchanged when animations are disabled.

## Implementation Map
- Hero + entry + section choreography:
  - `web/src/components/marketing/LandingExperience.tsx`
- Design tokens and tone classes:
  - `web/src/app/globals.css`
- Font system:
  - `web/src/app/layout.tsx`

## Immediate Next Iteration
1. Add section-level color transitions to `JurisdictionCarousel`.
2. Add mobile-specific hero simplification for <`768px`.
3. Add visual regression snapshots for top, mid, and CTA states.
4. Tune image assets for higher fidelity in architecture stack.
