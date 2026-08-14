import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Lab Results" };

export default function LabResultsPage() {
  return (
    <LegalDoc title="Lab Results">
      <p>
        Certificates of analysis (COAs) and third-party lab testing documentation
        will be published here. Placeholder, documents pending.
      </p>
      <div className="pt-2">
        <Badge variant="outline">Coming Soon</Badge>
      </div>
      <p>
        Each production lot is tested to confirm it contains under 400 ppm
        7-hydroxymitragynine on a dry weight basis, with no added 7-OH. COA links
        to be added.
      </p>
    </LegalDoc>
  );
}
