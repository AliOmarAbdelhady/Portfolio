import { SITE } from "@/lib/constants";

export type SocialLink = {
  id: string;
  label: string;
  href: string;
  /** Lucide icon name handled in the component layer; kept as a hint here. */
  icon: "github" | "orcid" | "linkedin" | "mail" | "file";
  /** If true, the value is a placeholder the owner must replace. */
  placeholder?: boolean;
};

/**
 * Real channels first (GitHub, ORCID). LinkedIn / email / resume are editable
 * placeholders surfaced in SITE — replace before deploy.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: SITE.githubUrl,
    icon: "github",
  },
  {
    id: "orcid",
    label: "ORCID",
    href: SITE.orcid,
    icon: "orcid",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: SITE.linkedinUrl,
    icon: "linkedin",
    placeholder: !SITE.linkedinUrl,
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:${SITE.email}`,
    icon: "mail",
  },
];
