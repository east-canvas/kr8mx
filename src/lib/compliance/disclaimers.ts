/**
 * Shared compliance strings (site footer + email templates). Lives under
 * /compliance/ so the claim-denylist guard excludes it, these are required
 * regulatory disclaimers, not marketing claims.
 */
export const FDA_DISCLAIMER =
  "This product has not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export const AGE_NOTICE = "Not for sale to persons under the age of 21.";

export const OPERATOR_LINE =
  "Operated under Gel Trading Group LLC, LIC# 2027-R-2248133";

export const LAB_NOTICE =
  "Contains 0 PPM 7-hydroxymitragynine on a dry weight basis. 21+ adult use only.";

// TODO-VERIFY: CAN-SPAM requires a valid physical postal address in bulk email.
export const MAILING_ADDRESS = "TODO: physical mailing address";
