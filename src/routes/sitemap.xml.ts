// eslint-disable-next-line @typescript-eslint/no-var-requires
import posts from './blog/_posts';

import flatten from 'flatten';
import { convertToSlug } from '../helpers/utils';

import fs from 'fs';
import type { Post } from '../models/post';

const BASE_URL = 'https://markushatvan.com';
const pages = [''];

fs.readdirSync('./src/routes').forEach((file) => {
  file = file.split('.')[0];
  if (
    file.charAt(0) !== '_' &&
    file !== 'sitemap' &&
    file !== 'index' &&
    file !== 'rss'
  ) {
    pages.push(file);
  }
});

const generateCategories = () => {
  const uniqueCategories = posts
    .map((post: Post) => post.category)
    .filter((category: string, idx: number, arr: string[]) => arr.indexOf(category) === idx);

  return uniqueCategories
    .map(
      (uniqueCategory: string) => `
      <url><loc>${BASE_URL}/categories/${convertToSlug(
        uniqueCategory,
      )}/</loc><priority>0.85</priority></url>
        `,
    )
    .join('\n');
};

const generateTags = () => {
  const allTags = posts.map((post: Post) => post.tags);
  const flattenedTags = flatten(allTags).filter(
    (tag: string, idx: number, arr: string[]) => arr.indexOf(tag) === idx,
  );

  return flattenedTags
    .map(
      (flattenedTag: string) => `
    <url><loc>${BASE_URL}/tags/${convertToSlug(flattenedTag), { lower: true }}/</loc><priority>0.85</priority></url>
      `,
    )
    .join('\n');
};

const render = (pages: string[], posts: Post[]) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  ${pages
    .map(
      (page: string) => `
    <url><loc>${BASE_URL}/${page ? `${page}/` : ''}</loc><priority>0.85</priority></url>
  `,
    )
    .join('\n')}
  ${posts
    .map(
      (post: Post) => `
    <url>
      <loc>${BASE_URL}/blog/${post.slug}/</loc>
      <priority>0.69</priority>
    </url>
  `,
    )
    .join('\n')}
    ${generateCategories()}
    ${generateTags()}
</urlset>
`;

/* eslint-disable-next-line */
export function get(req: any, res: any, next: any): void {
  res.setHeader('Cache-Control', `max-age=0, s-max-age=${600}`); // 10 minutes
  res.setHeader('Content-Type', 'application/rss+xml');

  const sitemap = render(pages, posts);
  res.end(sitemap);
}
