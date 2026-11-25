import 'server-only';
import { createClient } from '@vercel/edge-config';
import { safeContentHref } from './contentUrls';

export type ProjectTone = "light" | "dark";
export type ProjectAction = "link" | "copy-current-url";
export type ProjectActionIcon = "download" | "open" | "link";

export interface ProjectLink {
  label: string;
  url: string;
  primary?: boolean;
}

export interface Project {
  title: string;
  thumbnail: string;
  description: string;
  tags?: string[];
  links?: ProjectLink[];
  bodyUrl?: string;
  actionUrl?: string;
  icon?: string;
  tone: ProjectTone;
  action: ProjectAction;
  actionIcon: ProjectActionIcon;
}

// Offline/outage fallback only. The Edge Config `projects` array is authoritative,
// including its order and an intentionally empty list.
export const DEFAULT_PROJECTS: Project[] = [
  {
    title: "The Collection",
    thumbnail: "/images/home/projects/twidget-card.png",
    icon: "/images/home/projects/blur-widget-icon.png",
    description:
      "A black/white catalog and marketplace for your shoe and clothes collection, with customer accounts, a saved basket and wishlist, delivery addresses, order tracking, seller tools, an active shipper delivery network, and a password-protected admin panel.",
    tags: ["Website"],
    bodyUrl: "https://github.com/Burnomus14/website",
    actionUrl: "https://website-2r4b.onrender.com/",
    links: [
      {
        label: "Preview",
        url: "https://website-2r4b.onrender.com/",
        primary: true,
      },
    ],
    tone: "light",
    action: "link",
    actionIcon: "open",
  },
  {
    title: "Equalizer314 Setup",
    thumbnail: "/images/home/projects/blur-widget-card.png",
    icon: "/images/home/projects/twidget-icon.png",
    description:
      "156 EQ presets, a restore backup and 169 virtual surround files for Equalizer314, plus a beginner guide and a one-click download portal.",
    tags: ["Android", "Audio", "EQ"],
    bodyUrl: "https://github.com/Burnomus14/Equalizer314-Setup",
    links: [
      {
        label: "Download portal",
        url: "https://burnomus14.github.io/Equalizer314-Setup/",
        primary: true,
      },
      {
        label: "Get the app",
        url: "https://github.com/bearinmindcat/Equalizer314/releases",
      },
    ],
    tone: "dark",
    action: "link",
    actionIcon: "download",
    actionUrl: "https://burnomus14.github.io/Equalizer314-Setup/",
  },
  {
    title: "Farm Machinery Infographics",
    thumbnail: "/images/home/projects/one-ui-design-kit-card.png",
    description: "Infographics explaining farm machinery.",
    tags: ["Agriculture", "Education"],
    bodyUrl: "https://github.com/Burnomus14/farm-machinery-infographics",
    actionUrl: "https://lovable.dev/preview/zYnnqyHptJg9aWhvEhMfYcpangAhss3vusse",
    links: [
      {
        label: "Preview",
        url: "https://lovable.dev/preview/zYnnqyHptJg9aWhvEhMfYcpangAhss3vusse",
        primary: true,
      },
    ],
    tone: "dark",
    action: "link",
    actionIcon: "open",
  },
  {
    title: "This website",
    thumbnail: "/images/home/projects/twidget-card.png",
    description: "The very thing you’re looking at right now.",
    tone: "light",
    action: "copy-current-url",
    actionIcon: "link",
  },
];

function projectFromConfig(value: unknown): Project | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (item.enabled === false) return null;
  if (typeof item.title !== 'string' || !item.title.trim() ||
      typeof item.thumbnail !== 'string') return null;

  const thumbnail = safeContentHref(item.thumbnail, true);
  if (!thumbnail || thumbnail.startsWith('#')) return null;
  const description = item.description ?? item.tag ?? '';
  if (typeof description !== 'string') return null;
  const rawTags = item.tags;
  if (rawTags !== undefined && (!Array.isArray(rawTags) || rawTags.some(tag => typeof tag !== 'string'))) return null;
  const tags = Array.isArray(rawTags) ? rawTags.map(tag => tag.trim()).filter(Boolean) : [];
  const rawLinks = item.links;
  if (rawLinks !== undefined && !Array.isArray(rawLinks)) return null;
  const links: ProjectLink[] = [];
  if (Array.isArray(rawLinks)) {
    for (const value of rawLinks) {
      if (!value || typeof value !== 'object') return null;
      const link = value as Record<string, unknown>;
      const label = typeof link.label === 'string' ? link.label.trim() : '';
      const url = typeof link.url === 'string' ? safeContentHref(link.url) : '';
      if (!label || !url || url.startsWith('#') ||
          (link.primary !== undefined && typeof link.primary !== 'boolean')) return null;
      links.push({
        label,
        url,
        ...(typeof link.primary === 'boolean' ? { primary: link.primary } : {}),
      });
    }
  }
  const tone = item.tone ?? 'dark';
  const action = item.action ?? 'link';
  const actionIcon = item.actionIcon ?? (action === 'copy-current-url' ? 'link' : 'open');
  if (tone !== 'light' && tone !== 'dark') return null;
  if (action !== 'link' && action !== 'copy-current-url') return null;
  if (actionIcon !== 'download' && actionIcon !== 'open' && actionIcon !== 'link') return null;

  const bodyValue = item.bodyUrl ?? item.url;
  const actionValue = item.actionUrl ?? bodyValue;
  const bodyUrl = typeof bodyValue === 'string' ? safeContentHref(bodyValue) : '';
  const actionUrl = typeof actionValue === 'string' ? safeContentHref(actionValue) : '';
  if ((typeof bodyValue === 'string' && bodyValue.trim() && !bodyUrl) ||
      (typeof actionValue === 'string' && actionValue.trim() && !actionUrl)) return null;
  if (action === 'link' && !actionUrl && links.length === 0) return null;
  const icon = typeof item.icon === 'string' ? safeContentHref(item.icon, true) : '';

  return {
    title: item.title.trim(), thumbnail, description, tone, action, actionIcon,
    ...(tags.length ? { tags } : {}),
    ...(links.length ? { links } : {}),
    ...(bodyUrl ? { bodyUrl } : {}),
    ...(actionUrl ? { actionUrl } : {}),
    ...(icon && !icon.startsWith('#') ? { icon } : {}),
  };
}

export async function getProjects(): Promise<Project[]> {
  const connectionString = process.env.EDGE_CONFIG;
  if (!connectionString) return DEFAULT_PROJECTS;

  try {
    // Do not persist this read in Next's Data Cache: edits must work without a deploy.
    const value = await createClient(connectionString, { cache: 'no-store' }).get('projects');
    if (!Array.isArray(value)) return DEFAULT_PROJECTS;
    return value.map(projectFromConfig).filter((project): project is Project => project !== null);
  } catch {
    return DEFAULT_PROJECTS;
  }
}
