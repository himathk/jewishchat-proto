import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "c-business",
    name: "Business & Trades",
    slug: "business-trades",
    description: "Contractors, suppliers, and service providers serving the community.",
    icon: "Briefcase",
    groupCount: 412,
  },
  {
    id: "c-torah",
    name: "Torah & Learning",
    slug: "torah-learning",
    description: "Daily shiurim, chavrusa matching, and study groups.",
    icon: "BookOpen",
    groupCount: 638,
  },
  {
    id: "c-shuls",
    name: "Shuls & Minyanim",
    slug: "shuls-minyanim",
    description: "Minyan times, davening updates, and shul announcements.",
    icon: "Landmark",
    groupCount: 521,
  },
  {
    id: "c-realestate",
    name: "Real Estate",
    slug: "real-estate",
    description: "Rentals, sales, and listings across communities.",
    icon: "Building2",
    groupCount: 287,
  },
  {
    id: "c-jobs",
    name: "Jobs & Parnassa",
    slug: "jobs-parnassa",
    description: "Openings, freelance work, and hiring boards.",
    icon: "BriefcaseBusiness",
    groupCount: 244,
  },
  {
    id: "c-chesed",
    name: "Chesed & Tzedakah",
    slug: "chesed-tzedakah",
    description: "Volunteering, gemachs, and mutual aid networks.",
    icon: "HeartHandshake",
    groupCount: 356,
  },
  {
    id: "c-simchas",
    name: "Simchas & Events",
    slug: "simchas-events",
    description: "Weddings, bar mitzvahs, and community events.",
    icon: "PartyPopper",
    groupCount: 198,
  },
  {
    id: "c-food",
    name: "Food & Kashrus",
    slug: "food-kashrus",
    description: "Kosher restaurants, caterers, and hashgacha alerts.",
    icon: "UtensilsCrossed",
    groupCount: 309,
  },
  {
    id: "c-marketplace",
    name: "Marketplace",
    slug: "marketplace",
    description: "Buy, sell, and trade within the community.",
    icon: "Tags",
    groupCount: 467,
  },
  {
    id: "c-shidduchim",
    name: "Shidduchim",
    slug: "shidduchim",
    description: "Shadchanim, singles networks, and resource groups.",
    icon: "Users",
    groupCount: 132,
  },
  {
    id: "c-travel",
    name: "Travel & Aliyah",
    slug: "travel-aliyah",
    description: "Flights, hosting, and moving to Eretz Yisrael.",
    icon: "Plane",
    groupCount: 176,
  },
  {
    id: "c-health",
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Practitioners, support groups, and referrals.",
    icon: "Stethoscope",
    groupCount: 221,
  },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
