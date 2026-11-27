/** Public origin of the production site; override for another deployment. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://v0-farm-contact-website.vercel.app';
