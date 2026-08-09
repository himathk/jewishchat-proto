import { CATEGORIES, categoryById } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const SITE_URL = "https://jewishchat.example";

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JewishChat",
    url: SITE_URL,
    description:
      "A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and community life.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildItemListSchema() {
  const top = [...PUBLIC_GROUPS]
    .sort((a, b) => b.metrics.uniqueViews - a.metrics.uniqueViews)
    .slice(0, 8);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most active WhatsApp groups this week",
    numberOfItems: top.length,
    itemListElement: top.map((group, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: group.name,
      description: group.shortDescription,
      url: `${SITE_URL}/${categoryById(group.categoryId)?.slug ?? "group"}/${group.slug}`,
    })),
  };
}

export function buildCategoryListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Group categories",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((category, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: category.name,
      description: category.description,
      url: `${SITE_URL}/${category.slug}`,
    })),
  };
}
