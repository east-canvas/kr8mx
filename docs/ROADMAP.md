# KR8MX Roadmap

Working roadmap for kr8mx.com. Organized by area. Standard flow: build on
`develop`, deploy to `main` for production.

---

## Now / Next

### QuickBooks Online (QBO) invoicing — planned, blocked on Intuit setup

Turn a sales order into a QuickBooks invoice.

Decisions (locked):
- Trigger: a manual **"Send to QuickBooks"** button on the order (not automatic).
- Environment: build against the **QBO Sandbox** first, then flip to the live
  company by swapping to production keys.
- Line items: **map each KR8MX SKU to a QBO Item** (cleaner books/reporting).

Build phases (once connected):
1. `qbo_connection` table storing OAuth tokens + `realmId`, with auto-refresh.
2. OAuth connect flow: "Connect QuickBooks" in admin, callback at
   `/api/qbo/callback` stores the tokens.
3. SKU to QBO Item mapping admin screen (find-or-create).
4. "Send to QuickBooks" on an order: find-or-create customer, map lines from
   SKUs + prices, POST invoice, save QBO invoice id + deep link on the order.
   Idempotent (one order = one invoice).
5. Invoice status shown on the order (not invoiced / invoiced #, view in QBO)
   plus clear error surfacing.

Prerequisite (AJ, in the Intuit Developer portal):
- Create an app: QuickBooks Online Accounting.
- Grab the **Sandbox** `Client ID` + `Client Secret`.
- Add redirect URI `https://kr8mx.com/api/qbo/callback`.
- Scope: `com.intuit.quickbooks.accounting`.
- Send the sandbox Client ID + Secret to add to the environment (like the
  Resend key). Then the flow is built and verified end-to-end in sandbox.

Note: invoices need prices, so an order must have prices on its lines before it
can be pushed. The button will require this and flag any missing prices.

Can start now (no keys needed): the connection + mapping schema, the SKU to Item
mapping screen, and the order's invoice status/button (inert until connected).

---

## Backlog — Admin / Ops

- Live order totals on the New Order form (running case/bottle count + total as
  you type).
- Sales orders list + order detail: higher-contrast redesign pass.
- Public / self-serve wholesale ordering (approved accounts submit orders that
  feed the same pipeline). Larger scope.

## Backlog — Storefront / UX

- PDP flavor quick-switch (cross-fade the product image + accent in place
  instead of a full reload).
- Animated spec spotlight (the 100 / 200 / 300 mg breakdown filling on scroll).
- Page-transition fades between routes.
- COA / "0 PPM verified" trust module on the homepage and PDPs.
- Carry the blister "Coming Soon" band treatment onto the tablets collection
  page.
- Accessibility + performance pass; optional dark theme.

## Backlog — Content / Compliance / Config

- Flip lead notifications to `info@kr8mx.com` (set `LEADS_NOTIFY_EMAIL`) once
  that inbox is live. Currently redirects to `aj@gelhq.com`.
- CAN-SPAM: add a real physical mailing address to marketing emails (launch +
  alerts) when one is available. Transactional emails do not need it.
- Add `sameAs` verified social profile URLs to the Organization JSON-LD.

---

## Done (recent)

- Contact / wholesale lead capture: segmented form, DB pipeline, internal
  notification + branded auto-reply, marketing opt-in, `/admin/leads` console
  with status + CSV export.
- Lead to Order: "Create order" prefills the New Order form from a lead.
- Products admin: higher-contrast redesign, defaults to tablets, quick-jump nav,
  inline price + Active/Coming soon availability toggle.
- Order intake + contact form refinements.
- Homepage blister-pack band with dark-to-purple "Coming Soon" fade.
- Motion system: scroll progress bar, trust marquee, count-ups, slashed-X
  dividers, hero entrance, mobile drawer, back-to-top, PDP tilt + sticky CTA,
  flavor-themed PDP scroll bar. All respect prefers-reduced-motion.
- QR codes: apex domain + EC level L, dropping short-link codes from QR
  version 3 (29x29) to version 2 (25x25) for easier small-size scanning.
- Emails: email-only disclaimers; removed operator line, license number, and
  the mailing-address placeholder.
