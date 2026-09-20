export type XY = { x: number; y: number };

export type Bounds = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type GalleryItem = {
  image: string;
  location?: string;
  aspectRatio?: number;
};

export type GalleryTile = {
  id: string;
  item: GalleryItem;
  itemIndex: number;
};

export type ExpandedImage = {
  imageRect: Bounds;
  isClosing: boolean;
  isOpen: boolean;
  item: GalleryItem;
  targetRect: Bounds | null;
};

export type GalleryLayout = {
  colWidth: number;
  columns: number;
  itemsPerColumn: number;
  maxImageHeight: number;
  sheetHeight: number;
  sheetWidth: number;
};
