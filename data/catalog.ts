/** Keep in sync with the frontend (frontend/data/services.ts and gallery-categories.ts). */
const slugs = [
  "sheet-bending-shearing", "structural-sheds-roofing", "peb-buildings", "grills-safety-grills", "gates", "collapsible-gates", "staircases",
  "rolling-shutters", "container-body-building", "building-elevation", "sand-tails-sheds-houses", "expanded-metal-works", "stainless-steel-works", "general-fabrication-works",
] as const;
export type ServiceSlug = (typeof slugs)[number];
export const serviceSlugs = slugs;
export const serviceTitles: Record<ServiceSlug, string> = {
  "sheet-bending-shearing": "Sheet Bending & Shearing", "structural-sheds-roofing": "Structural Sheds & Roofing", "peb-buildings": "PEB Buildings",
  "grills-safety-grills": "Grills & Safety Grills", gates: "Gates", "collapsible-gates": "Collapsible Gates", staircases: "Staircases",
  "rolling-shutters": "Rolling Shutters", "container-body-building": "Container Body Building", "building-elevation": "Building Elevation",
  "sand-tails-sheds-houses": "Sand Tails Sheds & Houses", "expanded-metal-works": "Expanded Metal Works", "stainless-steel-works": "Stainless Steel Works",
  "general-fabrication-works": "General Fabrication Works",
};

const cats = ["factory", "machinery", "structural-sheds", "peb", "roofing", "gates", "grills", "staircases", "rolling-shutters", "container-bodies", "stainless-steel", "expanded-metal", "fabrication-process"] as const;
export type GalleryCategory = (typeof cats)[number];
export const galleryCategories = cats;
export const galleryLabels: Record<GalleryCategory, string> = {
  factory: "Factory", machinery: "Machinery", "structural-sheds": "Structural Sheds", peb: "PEB", roofing: "Roofing", gates: "Gates", grills: "Grills", staircases: "Staircases",
  "rolling-shutters": "Rolling Shutters", "container-bodies": "Container Bodies", "stainless-steel": "Stainless Steel", "expanded-metal": "Expanded Metal", "fabrication-process": "Fabrication Process",
};
