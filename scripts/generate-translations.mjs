/**
 * Extracts translated content from the zh-Hans build output and bundles it
 * into a single JSON file at static/translations.json.
 *
 * Usage: node scripts/generate-translations.mjs
 * Prerequisite: run `npx docusaurus build` first so build/zh-Hans/ exists.
 */

import {load} from 'cheerio';
import {readFileSync, writeFileSync, readdirSync, statSync, existsSync} from 'fs';
import {join, relative} from 'path';

const ZH_BUILD_DIR = join(process.cwd(), 'build', 'zh-Hans');
const STATIC_IMG_DIR = join(process.cwd(), 'static', 'img', 'app');
const OUTPUT_FILE = join(process.cwd(), 'static', 'translations.json');

if (!existsSync(ZH_BUILD_DIR)) {
  console.error('Error: build/zh-Hans/ not found. Run `npx docusaurus build` first.');
  process.exit(1);
}

// Build a map of image basenames for rewriting hashed paths
const imageBasenames = new Set();
if (existsSync(STATIC_IMG_DIR)) {
  for (const f of readdirSync(STATIC_IMG_DIR)) {
    // e.g. "MainSwapInterface" from "MainSwapInterface.png"
    const base = f.replace(/\.[^.]+$/, '');
    imageBasenames.add(base);
  }
}

/**
 * Rewrite hashed Docusaurus asset paths back to original static paths.
 * e.g. /assets/images/MainSwapInterface-bfc686a5bf8db1106dbbadbd7a668fdc.png
 *   -> /img/app/MainSwapInterface.png
 */
function rewriteImagePaths(html) {
  // Rewrite hashed build paths: /assets/images/Name-hash.ext -> /img/app/Name.ext
  html = html.replace(
    /\/assets\/images\/([A-Za-z0-9_]+)-[a-f0-9]+\.(png|jpg|jpeg|svg|gif|webp)/g,
    (match, name, ext) => {
      if (imageBasenames.has(name)) {
        return `/img/app/${name}.${ext}`;
      }
      return match;
    },
  );
  // Strip /zh-Hans prefix from all internal paths (images, links, etc.)
  html = html.replace(/\/zh-Hans\//g, '/');
  return html;
}

// Recursively find all index.html files
function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      findHtmlFiles(full, files);
    } else if (entry === 'index.html') {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = findHtmlFiles(ZH_BUILD_DIR);

// Global sidebar labels (same across all pages, extracted once)
const globalSidebar = {doc: {}, cat: {}};
let sidebarExtracted = false;

const pages = {};

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8');
  const $ = load(html);

  const rel = relative(ZH_BUILD_DIR, file).replace(/\/?index\.html$/, '');
  let pagePath = rel ? '/' + rel : '/';

  // Extract article HTML
  let articleHtml = $('article').html();
  if (!articleHtml) continue;

  // Rewrite hashed image paths to original static paths
  articleHtml = rewriteImagePaths(articleHtml);

  // Extract global sidebar labels once (they're the same on every page)
  if (!sidebarExtracted) {
    // Doc links: match by normalized href
    $('.menu__link:not(.menu__link--sublist-caret)').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const normalized = href.replace(/^\/zh-Hans/, '') || '/';
        globalSidebar.doc[normalized] = $(el).text().trim();
      }
    });

    // Category labels: keyed by first child doc href
    $('.menu__list-item-collapsible').each((_, el) => {
      const catLabel = $(el).find('> .menu__link--sublist-caret').first().text().trim();
      const firstChildHref = $(el).parent().find('.menu__link:not(.menu__link--sublist-caret)').first().attr('href');
      if (catLabel && firstChildHref) {
        const normalized = firstChildHref.replace(/^\/zh-Hans/, '') || '/';
        globalSidebar.cat[normalized] = catLabel;
      }
    });

    sidebarExtracted = true;
  }

  // Extract ToC labels
  const tocLabels = [];
  $('.table-of-contents__link').each((_, el) => {
    tocLabels.push($(el).text().trim());
  });

  // Extract breadcrumb labels
  const breadcrumbLabels = [];
  $('.breadcrumbs__link').each((_, el) => {
    breadcrumbLabels.push($(el).text().trim());
  });

  // Extract pagination labels
  const paginationLabels = [];
  $('.pagination-nav__label').each((_, el) => {
    paginationLabels.push($(el).text().trim());
  });

  pages[pagePath] = {
    article: articleHtml,
    tocLabels,
    breadcrumbLabels,
    paginationLabels,
  };
}

const translations = {globalSidebar, pages};
writeFileSync(OUTPUT_FILE, JSON.stringify(translations, null, 2));
console.log(`Generated translations for ${Object.keys(pages).length} pages -> ${OUTPUT_FILE}`);
