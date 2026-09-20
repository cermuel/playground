import type { GalleryItem, GalleryLayout } from "@/types/image";

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    image: "https://picsum.photos/seed/1/400/400",
    description: "A quiet moment in the city",
    location: "London, UK",
  },
  {
    image: "https://picsum.photos/seed/2/800/600",
    description: "Views from the countryside",
    location: "Newcastle, UK",
  },
  {
    image: "https://picsum.photos/seed/3/600/800",
    description: "Exploring somewhere new",
    location: "Paris, France",
  },
  {
    image: "https://picsum.photos/seed/4/1200/675",
    description: "Golden hour",
    location: "Lagos, Nigeria",
  },
  {
    image: "https://picsum.photos/seed/5/675/1200",
    description: "A beautiful afternoon",
    location: "Abuja, Nigeria",
  },
  {
    image: "https://picsum.photos/seed/6/900/600",
    description: "Weekend adventure",
    location: "Manchester, UK",
  },
  {
    image: "https://picsum.photos/seed/7/600/900",
    description: "Walking through the city",
    location: "Edinburgh, Scotland",
  },
  {
    image: "https://picsum.photos/seed/8/1000/500",
    description: "A view worth remembering",
    location: "Cape Town, South Africa",
  },
  {
    image: "https://picsum.photos/seed/9/500/1000",
    description: "Peaceful surroundings",
    location: "Birmingham, UK",
  },
  {
    image: "https://picsum.photos/seed/10/1280/720",
    description: "A perfect sunset",
    location: "Toronto, Canada",
  },
  {
    image: "https://picsum.photos/seed/11/720/1280",
    description: "Life through my lens",
    location: "Vancouver, Canada",
  },
  {
    image: "https://picsum.photos/seed/12/700/500",
    description: "Simple moments",
    location: "Dublin, Ireland",
  },
  {
    image: "https://picsum.photos/seed/13/500/700",
    description: "Another day outside",
    location: "Berlin, Germany",
  },
  {
    image: "https://picsum.photos/seed/14/1100/700",
    description: "Chasing new experiences",
    location: "Amsterdam, Netherlands",
  },
  {
    image: "https://picsum.photos/seed/15/700/1100",
    description: "An unforgettable view",
    location: "Rome, Italy",
  },
  {
    image: "https://picsum.photos/seed/16/1400/600",
    description: "The road ahead",
    location: "Oslo, Norway",
  },
  {
    image: "https://picsum.photos/seed/17/600/1400",
    description: "Lost in the moment",
    location: "Barcelona, Spain",
  },
  {
    image: "https://picsum.photos/seed/18/850/850",
    description: "A calm and beautiful place",
    location: "Lisbon, Portugal",
  },
  {
    image: "https://picsum.photos/seed/19/1024/768",
    description: "Memories from the journey",
    location: "Accra, Ghana",
  },
  {
    image: "https://picsum.photos/seed/20/768/1024",
    description: "One for the photo album",
    location: "Nairobi, Kenya",
  },
];

export const COLUMNS_BY_BREAKPOINT = {
  base: 2,
  sm: 3,
  md: 4,
  lg: 5,
};

export const GAP = 12;
export const EDGE_GAP = 16;
export const SHEET_COPIES = [-1, 0, 1];
export const EXPANDED_IMAGE_CLOSE_MS = 520;

export const INITIAL_GALLERY_LAYOUT: GalleryLayout = {
  colWidth: 160,
  columns: COLUMNS_BY_BREAKPOINT.base,
  itemsPerColumn: 10,
  sheetHeight: 1200,
  sheetWidth: 392,
};
