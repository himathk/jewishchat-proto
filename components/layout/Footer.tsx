import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { CATEGORIES } from "@/lib/data/categories";

const DIRECTORY_LINKS = [
  { label: "Browse all groups", href: "/directory" },
  { label: "Trending this week", href: "/trending" },
  { label: "Just listed", href: "/recent" },
  { label: "Add a group", href: "/add-group" },
];

const ACCOUNT_LINKS = [
  { label: "Log in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "My groups", href: "/my-groups" },
  { label: "Profile", href: "/profile" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Report a listing", href: "/report" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-ink-4 mb-4 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href="#"
              data-href={link.href}
              className="text-ink-2 hover:text-brand-deep text-[13.5px] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-surface-line bg-surface-card relative overflow-hidden border-t">
      <LatticeBackdrop className="text-brand-green/40 opacity-50" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <Link href="#" data-href="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="font-display text-ink-1 text-[20px] tracking-tight">
                JewishChat
              </span>
            </Link>
            <p className="text-ink-3 mt-5 text-[14px] leading-relaxed">
              A community-run directory of WhatsApp groups for Jewish business, learning, chesed
              and everyday life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-ink-4 mb-4 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
                Categories
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <Link
                      href="#"
                      data-href={`/${c.slug}`}
                      className="text-ink-2 hover:text-brand-deep text-[13.5px] transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <LinkColumn title="Directory" links={DIRECTORY_LINKS} />
            <LinkColumn title="Account" links={ACCOUNT_LINKS} />
            <LinkColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="border-surface-line mt-14 flex flex-col gap-3 border-t pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-4 text-[12.5px]">
            © 2026 JewishChat. All rights reserved.
          </p>
          <p className="text-ink-4 text-[12.5px]">
            Not affiliated with, endorsed by, or connected to WhatsApp or Meta.
          </p>
        </div>
      </div>
    </footer>
  );
}
