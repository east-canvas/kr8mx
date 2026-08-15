/**
 * Storefront route-transition wrapper. Next.js remounts a template on every
 * navigation (unlike layout, which persists), so the CSS fade in `.animate-page`
 * replays each time the route changes. Opacity-only, and disabled under
 * prefers-reduced-motion (see globals.css). Server component, no client JS.
 */
export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page">{children}</div>;
}
