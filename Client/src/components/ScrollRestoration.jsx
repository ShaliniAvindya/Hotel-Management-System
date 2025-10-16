import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top
    const scrollToTop = () => {
      console.log('[ScrollRestoration] scrollToTop called for pathname:', pathname);
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      } catch (err) {
        window.scrollTo(0, 0);
      }
    };

    console.log('[ScrollRestoration] pathname changed ->', pathname);
    if (window.__modalOpen) {
      console.log('[ScrollRestoration] skipping scroll because modal is open');
    } else {
      scrollToTop();
    }

    const onLoad = () => {
      console.log('[ScrollRestoration] load event fired for', pathname);
      scrollToTop();
    };
    window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, [pathname]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
};

export default ScrollRestoration;
