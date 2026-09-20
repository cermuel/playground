"use client";

import type { KeyboardEvent, RefObject } from "react";
import { GAP, SHEET_COPIES } from "@/constants/images";
import type { GalleryItem, GalleryLayout, GalleryTile } from "@/types/image";
import ImageItem from "@/components/images/image-item";

type ImagePlaneProps = {
  columnHeights: number[];
  columns: GalleryTile[][];
  layout: GalleryLayout;
  isLoading?: boolean;
  onImageLoad: () => void;
  onTileKeyDown: (
    event: KeyboardEvent<HTMLElement>,
    item: GalleryItem,
  ) => void;
  planeRef: RefObject<HTMLDivElement | null>;
};

export default function ImagePlane({
  columnHeights,
  columns,
  layout,
  isLoading = false,
  onImageLoad,
  onTileKeyDown,
  planeRef,
}: ImagePlaneProps) {
  return (
    <div
      ref={planeRef}
      aria-hidden="true"
      className="absolute left-0 top-0 will-change-transform"
    >
      {SHEET_COPIES.map((copyX) => (
        <div
          className="absolute left-0 top-0"
          key={copyX}
          style={{
            height: layout.sheetHeight,
            transform: `translate3d(${
              copyX * (layout.sheetWidth + GAP) - layout.sheetWidth - GAP
            }px, 0, 0)`,
            width: layout.sheetWidth,
          }}
        >
          {columns.map((column, col) => (
            <div
              className="absolute top-0 will-change-transform"
              data-column-track={col}
              key={`${copyX}:${col}`}
              style={{
                left: col * (layout.colWidth + GAP),
                width: layout.colWidth,
              }}
            >
              {SHEET_COPIES.map((columnCopy) => (
                <div
                  className="absolute left-0 top-0 flex flex-col"
                  data-measured-column={
                    copyX === 0 && columnCopy === 0 ? col : undefined
                  }
                  key={`${copyX}:${col}:${columnCopy}`}
                  style={{
                    gap: GAP,
                    transform: `translate3d(0, ${
                      columnCopy *
                        ((columnHeights[col] || layout.sheetHeight) + GAP) -
                      (columnHeights[col] || layout.sheetHeight) -
                      GAP
                    }px, 0)`,
                    width: layout.colWidth,
                  }}
                >
                  {column.map((tile) => (
                    <ImageItem
                      isSkeleton={isLoading}
                      key={`${copyX}:${col}:${columnCopy}:${tile.id}`}
                      maxHeight={layout.colWidth * 1.58}
                      onImageLoad={onImageLoad}
                      onKeyDown={onTileKeyDown}
                      tile={tile}
                      width={layout.colWidth}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
