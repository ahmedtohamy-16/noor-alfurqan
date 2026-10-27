import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://nooralfurqan.app";

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown>;
}

/** Per-route title, description, canonical, og/twitter tags and optional JSON-LD. */
export default function PageSeo({ title, description, path, jsonLd }: PageSeoProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
