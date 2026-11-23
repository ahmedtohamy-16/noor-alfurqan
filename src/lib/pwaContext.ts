/** App-shell workers must never control editor previews or OAuth callbacks. */
export const refuseAppWorker = (production: boolean, hostname: string, embedded: boolean, search: string): boolean => {
  const host = hostname.toLowerCase();
  const platformDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
  const label = host.split(".")[0];
  const preview = platformDomain && (/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label) || /^project--.+-dev$/.test(label));
  const editorDomain = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"]
    .some(domain => host === domain || host.endsWith(`.${domain}`));
  return !production || embedded || preview || editorDomain || new URLSearchParams(search).get("sw") === "off";
};