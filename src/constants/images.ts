import type { GalleryLayout } from "@/types/image";

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
export const MASONRY_HEIGHT_RATIOS = [0.62, 0.76, 0.9, 0.68, 1];
export const SKELETON_ASPECT_RATIOS = [
  0.78, 1.18, 0.92, 1.42, 0.84, 1.08, 1.3, 0.74,
];

export const INITIAL_GALLERY_LAYOUT: GalleryLayout = {
  colWidth: 160,
  columns: COLUMNS_BY_BREAKPOINT.base,
  itemsPerColumn: 10,
  maxImageHeight: 360,
  sheetHeight: 1200,
  sheetWidth: 392,
};
