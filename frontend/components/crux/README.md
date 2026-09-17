# components/crux/

CRUX-specific React components.

Examples:
- `EventCard.tsx` — event listing card
- `GalleryGrid.tsx` — photo/video gallery grid
- `PosterCarousel.tsx` — promotional poster carousel
- `PastEditionSection.tsx` — previous editions showcase

## Rules
- CRUX components are only used within `app/(public)/crux/` pages.
- They are presentational — no direct database calls.
- Data is fetched by page-level server components and passed as props.
