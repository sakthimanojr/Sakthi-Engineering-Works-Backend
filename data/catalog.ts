/** Keep in sync with the frontend (frontend/data/services.ts and gallery-categories.ts). */
const slugs = [
  "sheet-bending-shearing", "structural-sheds-roofing", "peb-buildings", "gates-grills", "staircases",
  "rolling-shutters", "container-body-building", "building-elevation", "sand-tails-sheds-houses", "expanded-metal-works", "stainless-steel-works", "general-fabrication-works",
] as const;
export type ServiceSlug = (typeof slugs)[number];
export const serviceSlugs = slugs;
export const serviceTitles: Record<ServiceSlug, string> & Record<string, string> = {
  "sheet-bending-shearing": "Sheet Bending & Shearing", "structural-sheds-roofing": "Structural Sheds & Roofing", "peb-buildings": "PEB Buildings",
  "gates-grills": "Gates, Grills & Collapsible Gates", staircases: "Staircases",
  "rolling-shutters": "Rolling Shutters", "container-body-building": "Container Body Building", "building-elevation": "Building Elevation",
  "sand-tails-sheds-houses": "Sand Tails Sheds & Houses", "expanded-metal-works": "Expanded Metal Works", "stainless-steel-works": "Stainless Steel Works",
  "general-fabrication-works": "General Fabrication Works",
  // Legacy aliases
  "grills-safety-grills": "Grills & Safety Grills", gates: "Gates", "collapsible-gates": "Collapsible Gates",
};

export const serviceDescriptions: Record<string, string> = {
  "sheet-bending-shearing": "Sheet cutting, power shearing, press brake bending, plate cutting and forming for industries, fabricators and project work.",
  "structural-sheds-roofing": "Industrial, factory and warehouse sheds with trusses, purlins, roof sheets and structural steel work.",
  "peb-buildings": "Pre-Engineered Buildings for warehouses and factories, with structural frames and roofing systems.",
  "gates-grills": "MS main gates, sliding and swing gates, collapsible security gates, and safety & window grills made to custom design and size.",
  staircases: "MS, industrial, spiral and straight staircases, platform stairs and handrails.",
  "rolling-shutters": "Manual, industrial, shop and heavy-duty rolling shutters, fabricated to order.",
  "container-body-building": "Container bodies, cargo bodies and commercial vehicle body fabrication.",
  "building-elevation": "Architectural steel elevation, facade and entrance structures, and modern elevation works.",
  "sand-tails-sheds-houses": "Sand-tail sheds and houses, agricultural and utility structures and related fabrication works.",
  "expanded-metal-works": "Expanded metal screens, mesh panels, partitions, fencing and safety panels.",
  "stainless-steel-works": "SS railings, gates, handrails, kitchen works and architectural stainless-steel fabrication.",
  "general-fabrication-works": "Custom fabrication, machine frames, platforms, supports, brackets, structural components and repair jobs.",
};

export interface CoverMeta {
  title?: string;
  description?: string;
  alt: string;
}

export function serializeCoverAlt(meta: { title?: string; description?: string; alt?: string }): string {
  if (!meta.title && !meta.description) {
    return meta.alt || "";
  }
  return JSON.stringify({
    title: meta.title?.trim() || "",
    description: meta.description?.trim() || "",
    alt: meta.alt?.trim() || "",
  });
}

export function parseCoverAlt(rawAlt: string): { title: string; description: string; alt: string } {
  if (rawAlt && rawAlt.startsWith("{") && rawAlt.endsWith("}")) {
    try {
      const parsed = JSON.parse(rawAlt);
      if (typeof parsed === "object" && parsed !== null) {
        return {
          title: typeof parsed.title === "string" ? parsed.title : "",
          description: typeof parsed.description === "string" ? parsed.description : "",
          alt: typeof parsed.alt === "string" ? parsed.alt : "",
        };
      }
    } catch {
      // not JSON
    }
  }
  return { title: "", description: "", alt: rawAlt || "" };
}

const cats = ["factory", "machinery", "structural-sheds", "peb", "roofing", "gates-grills", "staircases", "rolling-shutters", "container-bodies", "stainless-steel", "expanded-metal", "fabrication-process"] as const;
export type GalleryCategory = (typeof cats)[number];
export const galleryCategories = cats;
export const galleryLabels: Record<GalleryCategory, string> & Record<string, string> = {
  factory: "Factory", machinery: "Machinery", "structural-sheds": "Structural Sheds", peb: "PEB", roofing: "Roofing", "gates-grills": "Gates & Grills", staircases: "Staircases",
  "rolling-shutters": "Rolling Shutters", "container-bodies": "Container Bodies", "stainless-steel": "Stainless Steel", "expanded-metal": "Expanded Metal", "fabrication-process": "Fabrication Process",
  // Legacy aliases
  gates: "Gates", grills: "Grills",
};
