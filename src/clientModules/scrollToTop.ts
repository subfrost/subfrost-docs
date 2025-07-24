import { useLocation } from '@docusaurus/router';
import { useEffect } from 'react';

export const onRouteUpdate = ({ location, previousLocation }) => {
  if (location.pathname !== previousLocation?.pathname) {
    window.scrollTo(0, 0);
  }
};