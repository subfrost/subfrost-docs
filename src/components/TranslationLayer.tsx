import {useEffect, useRef, useCallback} from 'react';
import {useLocation} from '@docusaurus/router';
import {useLanguage} from '../contexts/LanguageContext';

type PageTranslation = {
  article: string;
  tocLabels: string[];
  breadcrumbLabels: string[];
  paginationLabels: string[];
};

type TranslationsData = {
  globalSidebar: {
    doc: Record<string, string>; // href -> Chinese label
    cat: Record<string, string>; // first-child href -> Chinese category label
  };
  pages: Record<string, PageTranslation>;
};

let translationsCache: TranslationsData | null = null;

async function loadTranslations(): Promise<TranslationsData> {
  if (translationsCache) return translationsCache;
  const res = await fetch('/translations.json');
  if (!res.ok) throw new Error('Failed to load translations.json');
  translationsCache = await res.json();
  return translationsCache!;
}

function normalizePath(pathname: string): string {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function TranslationLayer() {
  const {isChinese} = useLanguage();
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const translationsRef = useRef<TranslationsData | null>(null);

  const applyForCurrentPage = useCallback(() => {
    const translations = translationsRef.current;
    if (!translations || !isChinese) return;

    const pathname = normalizePath(location.pathname);
    const pageData = translations.pages[pathname];
    if (!pageData) return;

    const article = document.querySelector('article');
    if (!article) return;

    applyTranslation(pageData, translations.globalSidebar);
  }, [isChinese, location.pathname]);

  useEffect(() => {
    if (!isChinese) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      restoreOriginals();
      return;
    }

    let cancelled = false;

    loadTranslations()
      .then((translations) => {
        if (cancelled) return;
        translationsRef.current = translations;

        // Apply translation immediately for the current page
        const pathname = normalizePath(location.pathname);
        const pageData = translations.pages[pathname];
        if (pageData) {
          applyTranslation(pageData, translations.globalSidebar);
        }

        // Set up MutationObserver to re-apply translation when React
        // re-renders (e.g., after client-side navigation)
        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        const mainWrapper = document.querySelector('.main-wrapper') || document.body;
        observerRef.current = new MutationObserver(() => {
          const article = document.querySelector('article');
          if (!article) return;

          // If article doesn't have our marker, React overwrote it
          if (!article.hasAttribute('data-translated')) {
            const currentPathname = normalizePath(window.location.pathname);
            const data = translationsRef.current?.pages[currentPathname];
            if (data) {
              applyTranslation(data, translationsRef.current!.globalSidebar);
            }
          }
        });

        observerRef.current.observe(mainWrapper, {
          childList: true,
          subtree: true,
        });
      })
      .catch((err) => {
        console.warn('Translation loading failed:', err.message);
      });

    return () => {
      cancelled = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isChinese]);

  // When pathname changes while Chinese is active, re-apply after React renders
  useEffect(() => {
    if (!isChinese || !translationsRef.current) return;

    const raf = requestAnimationFrame(() => {
      const pathname = normalizePath(location.pathname);
      const pageData = translationsRef.current?.pages[pathname];
      if (pageData) {
        applyTranslation(pageData, translationsRef.current!.globalSidebar);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, isChinese]);

  return null;
}

function applyTranslation(
  data: PageTranslation,
  sidebar: TranslationsData['globalSidebar'],
) {
  // 1. Article content
  const article = document.querySelector('article');
  if (article && data.article) {
    if (!article.hasAttribute('data-original-html')) {
      article.setAttribute('data-original-html', article.innerHTML);
    }
    article.innerHTML = data.article;
    article.setAttribute('data-translated', 'true');
  }

  // 2. Sidebar doc links — match by href
  if (sidebar.doc) {
    document
      .querySelectorAll<HTMLAnchorElement>('.menu__link:not(.menu__link--sublist-caret)')
      .forEach((link) => {
        const href = link.getAttribute('href');
        if (href && sidebar.doc[href]) {
          if (!link.hasAttribute('data-original-text')) {
            link.setAttribute('data-original-text', link.textContent || '');
          }
          link.textContent = sidebar.doc[href];
        }
      });
  }

  // 3. Sidebar category labels — match by first child doc href
  if (sidebar.cat) {
    document
      .querySelectorAll<HTMLElement>('.menu__list-item-collapsible')
      .forEach((item) => {
        const catLink = item.querySelector<HTMLElement>('.menu__link--sublist-caret');
        // Find the first doc link in this category's submenu
        const firstDocLink = item.parentElement?.querySelector<HTMLAnchorElement>(
          '.menu__link:not(.menu__link--sublist-caret)',
        );
        const firstDocHref = firstDocLink?.getAttribute('href');
        if (catLink && firstDocHref && sidebar.cat[firstDocHref]) {
          if (!catLink.hasAttribute('data-original-text')) {
            catLink.setAttribute('data-original-text', catLink.textContent || '');
          }
          catLink.textContent = sidebar.cat[firstDocHref];
        }
      });
  }

  // 4. Table of contents
  if (data.tocLabels) {
    const tocLinks = document.querySelectorAll<HTMLElement>('.table-of-contents__link');
    data.tocLabels.forEach((label, i) => {
      const el = tocLinks[i];
      if (el && label) {
        if (!el.hasAttribute('data-original-text')) {
          el.setAttribute('data-original-text', el.textContent || '');
        }
        el.textContent = label;
      }
    });
  }

  // 5. Pagination (prev/next)
  if (data.paginationLabels) {
    const pagLabels = document.querySelectorAll<HTMLElement>('.pagination-nav__label');
    data.paginationLabels.forEach((label, i) => {
      const el = pagLabels[i];
      if (el && label) {
        if (!el.hasAttribute('data-original-text')) {
          el.setAttribute('data-original-text', el.textContent || '');
        }
        el.textContent = label;
      }
    });
  }

  // 6. Breadcrumbs
  if (data.breadcrumbLabels) {
    const breadcrumbs = document.querySelectorAll<HTMLElement>('.breadcrumbs__link');
    data.breadcrumbLabels.forEach((label, i) => {
      const el = breadcrumbs[i];
      if (el && label) {
        if (!el.hasAttribute('data-original-text')) {
          el.setAttribute('data-original-text', el.textContent || '');
        }
        el.textContent = label;
      }
    });
  }
}

function restoreOriginals() {
  const article = document.querySelector('article[data-original-html]');
  if (article) {
    article.innerHTML = article.getAttribute('data-original-html') || '';
    article.removeAttribute('data-original-html');
    article.removeAttribute('data-translated');
  }

  document.querySelectorAll<HTMLElement>('[data-original-text]').forEach((el) => {
    el.textContent = el.getAttribute('data-original-text') || '';
    el.removeAttribute('data-original-text');
  });
}
