/** Keep auth redirects on this origin while preserving the requested route. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/account";
  return value;
}
