import { COLUMNS_BY_BREAKPOINT, GALLERY_ITEMS } from "@/constants/images";
import type { Bounds, ExpandedImage, GalleryItem } from "@/types/image";

export const wrap = (value: number, size: number) =>
  ((value % size) + size) % size;

export const toBounds = (rect: DOMRect): Bounds => ({
  height: rect.height,
  left: rect.left,
  top: rect.top,
  width: rect.width,
});

export const fitImageRect = (slot: DOMRect, aspectRatio: number): Bounds => {
  const slotAspectRatio = slot.width / slot.height;
  const width =
    slotAspectRatio > aspectRatio ? slot.height * aspectRatio : slot.width;
  const height =
    slotAspectRatio > aspectRatio ? slot.height : slot.width / aspectRatio;

  return {
    height,
    left: slot.left + (slot.width - width) / 2,
    top: slot.top + (slot.height - height) / 2,
    width,
  };
};

export const getColumnCount = () => {
  if (window.innerWidth >= 1024) return COLUMNS_BY_BREAKPOINT.lg;
  if (window.innerWidth >= 768) return COLUMNS_BY_BREAKPOINT.md;
  if (window.innerWidth >= 640) return COLUMNS_BY_BREAKPOINT.sm;
  return COLUMNS_BY_BREAKPOINT.base;
};

export const pickItemIndex = (col: number, index: number) => {
  return Math.abs(col * 7 + index * 5 + col * index) % GALLERY_ITEMS.length;
};

export const getItemLabel = (item: GalleryItem) => {
  return [item.description, item.location].filter(Boolean).join(", ");
};

export const hasItemMetadata = (item: GalleryItem) => {
  return Boolean(item.description || item.location);
};

export const getExpandedImageTransform = (expandedImage: ExpandedImage) => {
  const imageScale =
    expandedImage.targetRect && expandedImage.imageRect.width > 0
      ? expandedImage.targetRect.width / expandedImage.imageRect.width
      : 1;

  if (!expandedImage.isOpen || !expandedImage.targetRect) {
    return "translate3d(0, 0, 0) scale(1)";
  }

  return `translate3d(${
    expandedImage.targetRect.left - expandedImage.imageRect.left
  }px, ${
    expandedImage.targetRect.top - expandedImage.imageRect.top
  }px, 0) scale(${imageScale})`;
};
