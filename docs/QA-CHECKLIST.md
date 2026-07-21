# KR8MX — Launch QA Checklist

Run before any production release. Automated gates first, then manual passes.

## Automated (must pass)

- [ ] `npm run typecheck` — no TypeScript errors
- [ ] `npm run build` — production build succeeds (runs the content-guard prebuild)
- [ ] `npm test` — full suite green (seed integrity, cents math, order state
      machine, compliance gate, restriction lookup, **claim-denylist guard +
      whitelist**, drink variant selection, JSON-LD shape, order pricing/draft)
- [ ] `npm run content-guard` — no prohibited claim words in marketing copy

## Manual QA

### Compliance
- [ ] **Age gate** shows full-screen on first visit; "I am under 21" blocks;
      confirming persists 30 days (no re-prompt on reload); focus is trapped.
- [ ] **Footer** on every page: FDA disclaimer, "not for sale under 21",
      state-availability line, operator line (Gel Trading Group LLC — LIC#).
- [ ] **Restriction blocking**: at checkout, a restricted ship-state (AL/AR/IN/
      RI/VT/WI) is rejected with a reason.

### Theme zones (desktop + mobile 320/360/390)
- [ ] Home renders precision (light); the Drinks panel is a contained dark
      vitrine; no horizontal overflow / no pinch-zoom.
- [ ] `/drinks` renders entirely in the performance (dark) theme; hero image +
      flavor cards; acid-lime only on CTAs/active states.
- [ ] `/styleguide` — every primitive reads correctly in both zones.

### Commerce
- [ ] **Cart math**: add multiple variants/quantities; subtotal + line totals
      correct to the cent; header count updates.
- [ ] **Checkout → order** (mock, no processor): place an order; confirm an
      order row + items + events are written; confirmation page shows totals and
      the "payment not enabled" notice.
- [ ] **Mock payment flow end-to-end**: cart → checkout → order confirmation.
      (When a processor is connected, verify redirect + webhook → `paid`.)
- [ ] Variant selector resolves the correct SKU + price on each PDP.

### Growth / ops
- [ ] **Notify capture** (tablets premarket / access) records to `notify_list`.
- [ ] **COA**: `/coa/drinks` + `/coa/tablets` list published COAs; "View COA"
      opens the file. Admin drag-and-drop upload publishes live.
- [ ] **Barcodes**: `/q/{code}` redirects to the current target; admin QR
      downloads (SVG/PNG) decode to the scan URL.

### SEO / ship-readiness
- [ ] `/sitemap.xml` and `/robots.txt` resolve; robots disallows /checkout,
      /cart, /account, /order, /admin, /api and allows AI crawlers.
- [ ] OG images resolve (dark for /drinks, light for /tablets); Organization +
      BreadcrumbList + Product/ProductGroup JSON-LD validate (Rich Results Test).
- [ ] 404 and error pages render in the precision theme.

---

## Outstanding TODOs

### TODO-VERIFY (legal / data — confirm with counsel, change as data)
- `shipping-restrictions.ts` — the kratom-product state map is **placeholder**;
  confirm every (category × state) entry with counsel and maintain as data.

### TODO-COPY / content
- `seed-data.ts` — **all prices are placeholders** (drinks 6/12/24, tablets
  10-tab/5-tab); replace with confirmed retail pricing.
- Legal route group (terms, privacy, shipping, refunds, lab-results) — pending
  counsel review; "Last updated" is TODO.
- PDP ingredients panel — "Full panel — TODO".
- Lab-results / COA `resultLine` copy — confirm analyte statement.

### TODO-BUILD (engineering, tracked for later prompts)
- Shipping + tax are placeholders (`pricing.ts`) — integrate real rates/tax.
- Payments — high-risk processor adapter (First Citizens / gateway) behind
  `src/lib/payments/`; Stripe module is a dormant reference implementation.
- `seo.ts` `sameAs` — add social profiles.
- `error.tsx` — wire an error reporter.
