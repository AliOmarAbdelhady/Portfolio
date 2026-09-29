import { SITE } from "@/lib/constants";

export type SocialLink = {
  id: string;
  label: string;
  href: string;
  /** Brand glyph handled in the component layer; kept as a hint here. */
  icon: "github" | "orcid" | "linkedin" | "mail" | "phone" | "facebook" | "instagram";
  /** If true, the value is a placeholder the owner must replace. */
  placeholder?: boolean;
};

/**
 * Real channels — GitHub, ORCID, LinkedIn, email, phone, and social profiles.
 * All values are verified against the CV / provided links.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: SITE.githubUrl,
    icon: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: SITE.linkedinUrl,
    icon: "linkedin",
  },
  {
    id: "orcid",
    label: "ORCID",
    href: SITE.orcid,
    icon: "orcid",
  },
  {
    id: "email",
    label: "Email",
    href: `mailto:${SITE.email}`,
    icon: "mail",
  },
  {
    id: "phone",
    label: "Phone",
    href: `tel:${SITE.phone}`,
    icon: "phone",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: SITE.facebookUrl,
    icon: "facebook",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: SITE.instagramUrl,
    icon: "instagram",
  },
];
