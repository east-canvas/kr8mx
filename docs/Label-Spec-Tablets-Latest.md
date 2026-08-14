# KR8MX Tablet Label Spec — LATEST ARTWORK (reference)

> **STATUS: PENDING — NOT YET APPLIED TO THE WEBSITE.**
> The live site still reflects the previous spec (150 mg Speciociliatine / 50 mg
> Mitragynine / 300 mg total, kratom-only framing). Do **not** sync the site to
> the numbers below until the new web art is ready — per owner direction, we do
> not want two conflicting specs live at once. This file is the source of truth
> for that future one-pass update.
>
> Source: Blue Razz bottle + blister artwork supplied 2026-08-14.

---

## 1. Product Facts (per the new label)

Serving Size: **1/2 tablet (scored)** · Servings per tablet: **2**

| Component | Per Serving (½ tablet) | Per Tablet |
|---|---|---|
| MitraGen+™ | 50 mg | **100 mg** |
| Speciociliatine | 50 mg | **100 mg** |
| Mitragynine | 12.5 mg | **25 mg** |
| Mitragyna Speciosa Extract | 62.5 mg | **125 mg** |
| Piperine (from Piper Nigrum fruit extract) | 1 mg | **2 mg** |
| Paraxanthine | 25 mg | **50 mg** |
| **Total Kratom Alkaloids** | **125 mg** | **250 mg** |
| 7-Hydroxymitragynine (7-OH) | — | **< 400 ppm on a dry weight basis** (see §4 discrepancy) |

**Other ingredients:** Microcrystalline Cellulose, Magnesium Stearate, Sodium
Citrate, Silica Oxide, Citric Acid Anhydrous, Di-Calcium Phosphate, Food Grade
Colorant, Artificially Flavored.

## 2. Pack / marketing figures

| Figure | Bottle | Blister |
|---|---|---|
| Tablets | 10 | 5 |
| Total servings | 20 | 10 |
| Servings per tablet | 2 | 2 |
| mg per serving (marketed) | 175 mg | 175 mg |
| Total per pack (marketed) | **3,500 mg per bottle** | **1,750 mg per pack** |
| Net weight (per tablet) | 0.18 oz (5.1 g) | 0.18 oz (5.1 g) |
| Barcode / UPC | 8 60016 22033 8 | 8 60016 34371 9 |

- "175 mg per serving" = MitraGen+ 50 + Speciociliatine 50 + Mitragynine 12.5 +
  Mitragyna Speciosa Extract 62.5 (excludes Piperine + Paraxanthine). 175 × 20 =
  3,500 mg/bottle; 175 × 10 = 1,750 mg/pack.
- **"Total Kratom Alkaloids" (250 mg/tablet) is the compliant per-tablet number**
  and excludes Paraxanthine and Piperine (correctly — neither is a kratom alkaloid).

## 3. Fixed label lines (mirror verbatim when syncing)

- Front: **"SPECIOCILIATINE TABLETS — POWERED BY MitraGen+™ (100 mg per tablet)"**
- **NOT A DIETARY SUPPLEMENT** / "Not a Dietary Supplement"
- **21+ — NOT FOR SALE TO PERSONS UNDER 21 YEARS OF AGE**
- Icons: **No 7-OH · No DCM · No Synthetics · No Masking Agents**
- FLORIDA COMPLIANT badge · SCAN FOR COA (QR)
- Store in a cool, dry place away from sunlight.
- Manufactured by: Gel Trading Group LLC, 3104 North Armenia Ave. STE 2,
  Tampa, FL, USA 33607 · **LIC# 2027-R-2248133**
- Directions: Take ½ tablet with water. Do not exceed 1 tablet in 24 hours. Do
  not use more than 2 days in any 7 days. Occasional use only. Effects may be
  delayed — do not take more. Consult a healthcare provider before use.

## 4. Discrepancies to resolve on the ARTWORK before we sync

1. **7-OH value conflicts between panels.** Bottle Product Facts and both fronts
   say **"< 400 ppm on a dry weight basis"**, but the **blister-back Product Facts
   says "0.001 ppm on a dry weight basis."** Pick one figure and make all panels
   agree before the site quotes it. (Site currently says "< 400 ppm".)

## 5. Changes vs. the spec currently on the website

| Field | Site now (old) | New label |
|---|---|---|
| Speciociliatine / tablet | 150 mg | **100 mg** |
| Mitragynine / tablet | 50 mg | **25 mg** |
| MitraGen+ / tablet | 100 mg | 100 mg (unchanged) |
| Total kratom alkaloids / tablet | 300 mg | **250 mg** |
| New actives | — | **Mitragyna Speciosa Extract 125 mg, Piperine 2 mg, Paraxanthine 50 mg** |
| Framing | "kratom leaf extract tablets" (kratom-only) | now includes non-kratom actives (Paraxanthine, Piperine) |

## 6. Compliance notes for the future sync

- **Paraxanthine is a stimulant.** The label discloses it and warns
  "STIMULANT + SEDATING ALKALOIDS." This is a factual ingredient disclosure —
  it does **not** license stimulant/energy/focus marketing claims on the site.
  Keep the §7 prohibited-claims rules as-is.
- **Piperine** functions as an absorption enhancer; the label says it "increases
  the effects of the alkaloids." Do **not** reintroduce "bioavailability" or
  potency language into marketing copy (previously flagged and removed).
- Warning-panel language ("opioid receptors", "opioid-like withdrawal", "may be
  habit forming", "effects may resemble opioids") is required **label/legal**
  text and is fine on labels/legal pages, but stays out of marketing copy (the
  content guard blocks those words in marketing files).
- The earlier "STRONG EXTENDED-RELEASE" wording flagged on the old bottle art is
  **not present** on this new artwork — that potency-language issue is resolved.

## 7. Site sync checklist (one-pass update when art is live)

When cleared to sync, update every location and, ideally, first centralize the
figures into a single `TABLET_COMPOSITION` constant so future changes are one edit:

- [ ] `src/lib/jsonld.ts` — `TABLET_COMPOSITION` + `tabletDescription()`
- [ ] `src/lib/seo.ts` — site + Organization description
- [ ] `src/lib/product-copy.ts` — 5 flavor blurbs ("100 mg per tablet" line)
- [ ] `src/app/(store)/science/page.tsx` — composition grid, FAQ answers, note
- [ ] `src/app/(store)/about/page.tsx` — intro description + standard section
- [ ] `src/app/(store)/page.tsx` — hero/pillar copy + image alt text
- [ ] `src/app/(store)/tablets/page.tsx` — metadata
- [ ] `src/app/(store)/tablets/[flavor]/page.tsx` — metadata, format line, accordion
- [ ] Footer / disclaimers — confirm 7-OH figure matches the resolved label value
- [ ] Confirm "300 mg total" → "250 mg total" everywhere; add new actives to the
      composition tables if we choose to surface the full panel
