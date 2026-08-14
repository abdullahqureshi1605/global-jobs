# Horizon Jobs — Production Checklist

## 1. Local Build

- [ ] `npm run build` completes successfully.
- [ ] `npm run dev` works without runtime errors.
- [ ] No unexplained browser console errors.
- [ ] No unexplained terminal errors.

## 2. Database

- [ ] Supabase production project is selected.
- [ ] `jobs` table exists.
- [ ] `resources` table exists.
- [ ] `job_reports` table exists.
- [ ] Row Level Security is enabled.
- [ ] Anonymous users cannot insert jobs.
- [ ] Anonymous users cannot update jobs.
- [ ] Anonymous users cannot delete jobs.
- [ ] Public users can read published jobs only.
- [ ] Public users can read published resources only.
- [ ] Service-role/secret credentials remain server-only.

## 3. Authentication

- [ ] Admin login works.
- [ ] Admin logout works.
- [ ] Unauthenticated users cannot access admin operations.
- [ ] Admin API endpoints reject unauthenticated requests.
- [ ] Admin area is noindex.

## 4. Security

- [ ] HTTPS enabled.
- [ ] HSTS enabled in production.
- [ ] X-Frame-Options enabled.
- [ ] X-Content-Type-Options enabled.
- [ ] Referrer-Policy enabled.
- [ ] Permissions-Policy enabled.
- [ ] WAF enabled.
- [ ] Bot protection enabled.
- [ ] API rate limiting enabled.
- [ ] DDoS protection enabled.
- [ ] No purchased traffic.
- [ ] No artificial engagement.
- [ ] No click-generation services.

## 5. SEO

- [ ] `sitemap.xml` works.
- [ ] `robots.txt` works.
- [ ] Canonical URLs work.
- [ ] JobPosting structured data works.
- [ ] Article structured data works.
- [ ] Breadcrumb structured data works.
- [ ] Admin pages are noindex.
- [ ] Test pages are noindex.
- [ ] Real production domain is used in `NEXT_PUBLIC_SITE_URL`.

## 6. Public UX

- [ ] Homepage works on desktop.
- [ ] Homepage works on mobile.
- [ ] Header works.
- [ ] Footer works.
- [ ] Back navigation works.
- [ ] Breadcrumbs work.
- [ ] Country pages work.
- [ ] Category pages work.
- [ ] Search works.
- [ ] Filters work.
- [ ] Job detail pages work.
- [ ] Saved Jobs work.
- [ ] Career Resources work.
- [ ] Related jobs work.
- [ ] Related resources work.
- [ ] Report a Job works.
- [ ] Contact page works.
- [ ] About page works.
- [ ] Privacy page works.
- [ ] Terms page works.
- [ ] Cookie Policy works.
- [ ] Disclaimer works.
- [ ] 404 page works.
- [ ] Error page works.
- [ ] Loading states work.

## 7. AdSense

- [ ] AdSense account is approved.
- [ ] Real publisher ID configured.
- [ ] `ads.txt` contains Google's exact supplied line.
- [ ] Ads are not placed beside navigation.
- [ ] Ads are not placed beside Apply buttons.
- [ ] Ads are not used as a content gate.
- [ ] Ads are not surrounded by misleading labels.
- [ ] Ads are not used with artificial traffic.
- [ ] Traffic monitoring is active.
- [ ] AdSense emergency switch is available.

## 8. Domain

- [ ] Production domain connected.
- [ ] HTTPS works.
- [ ] `www`/non-www preference configured.
- [ ] `NEXT_PUBLIC_SITE_URL` updated.
- [ ] Production environment variables configured.
- [ ] New production deployment created.

## 9. Google

- [ ] Google Search Console property created.
- [ ] Domain verified.
- [ ] Production sitemap submitted.
- [ ] URL Inspection tested.
- [ ] Important pages discovered successfully.

## 10. Final Smoke Test

- [ ] Homepage.
- [ ] Jobs.
- [ ] Country.
- [ ] Category.
- [ ] Job detail.
- [ ] Saved jobs.
- [ ] Career resources.
- [ ] Resource article.
- [ ] Report job.
- [ ] Contact.
- [ ] Admin.
- [ ] Admin job creation.
- [ ] Admin resource creation.
- [ ] Reported jobs.
- [ ] Sitemap.
- [ ] Robots.
- [ ] Health endpoint.