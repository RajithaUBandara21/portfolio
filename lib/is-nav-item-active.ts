/**
 * Whether a nav item's href matches the current pathname, treating nested
 * routes (e.g. /blog/some-post) as active for their parent nav item
 * (e.g. /blog). "/" only matches the exact home route.
 */
export function isNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
