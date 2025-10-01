// Chadlina v69.69
// File: src/clientModules/scrollToTop.ts
// Purpose: Docusaurus client module to scroll to the top of the page on route changes.
// This ensures that navigation to a new page always starts the user at the top, which is standard UX.
// Source: Docusaurus Lifecycle APIs - onRouteUpdate
// https://docusaurus.io/docs/advanced/client-modules#onrouteupdate

export const onRouteUpdate = ({ location, previousLocation }: { location: Location, previousLocation: Location | null }) => {
  // Only scroll to top if the path has changed, not on hash link clicks
  if (location.pathname !== previousLocation?.pathname) {
    window.scrollTo(0, 0);
  }
};