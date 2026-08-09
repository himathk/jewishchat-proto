export type Category = {
  id: string;
  name: string;
  /** FR-CM-02: public URL is domain/{slug} */
  slug: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  groupCount: number;
};

/** FR-ME-01 */
export type GroupMetrics = {
  totalViews: number;
  uniqueViews: number;
  totalClicks: number;
  uniqueClicks: number;
};

export type Group = {
  id: string;
  name: string;
  /** FR-GL-05: public URL is domain/{categorySlug}/{slug} */
  slug: string;
  shortDescription: string;
  about?: string;
  categoryId: string;
  additionalCategoryIds: string[];
  location: string;
  memberCount?: number;
  /** FR-GL-02 step 4: placeholder avatar when no photo uploaded */
  initials: string;
  /** FR-GV-04: link visible to authenticated users only */
  loginRestricted: boolean;
  /** FR-GS-02: suspended groups are never shown publicly */
  status: "active" | "suspended";
  metrics: GroupMetrics;
  createdAt: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type PlatformStat = {
  id: string;
  value: number;
  suffix?: string;
  label: string;
};
