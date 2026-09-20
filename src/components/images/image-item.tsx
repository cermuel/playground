"use client";

import { useState, type KeyboardEvent } from "react";
import type { GalleryItem, GalleryTile } from "@/types/image";
import {
  getItemLabel,
  getMasonryTileHeight,
  hasItemMetadata,
} from "@/utils/image.helpers";

type ImageItemProps = {
  isSkeleton?: boolean;
  maxHeight: number;
  onImageLoad: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, item: GalleryItem) => void;
  tile: GalleryTile;
  width: number;
};

export default function ImageItem({
  isSkeleton = false,
  maxHeight,
  onImageLoad,
  onKeyDown,
  tile,
  width,
}: ImageItemProps) {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const isImageLoaded = loadedImage === tile.item.image;
  const tileHeight = getMasonryTileHeight(tile.id, maxHeight);

  if (isSkeleton) {
    return (
      <div
        aria-hidden="true"
        className="animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80"
        style={{
          height: tileHeight,
          width,
        }}
      />
    );
  }

  const itemLabel = getItemLabel(tile.item);
  const hasMetadata = hasItemMetadata(tile.item);

  return (
    <figure
      aria-label={itemLabel || "Open image"}
      className="group relative m-0 overflow-hidden rounded-xl bg-zinc-200 transition-transform duration-150 active:scale-[0.96] dark:bg-zinc-800"
      data-item-index={tile.itemIndex}
      onKeyDown={(event) => onKeyDown(event, tile.item)}
      role="button"
      tabIndex={0}
      style={{
        height: tileHeight,
        width,
      }}
    >
      {!isImageLoaded && !imageLoadError ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-zinc-200/80 dark:bg-zinc-800/80"
        />
      ) : null}
      {imageLoadError ? (
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Image unavailable
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={itemLabel || ""}
          className="block h-full w-full select-none object-cover"
          draggable={false}
          onError={() => setImageLoadError(true)}
          onLoad={() => {
            setLoadedImage(tile.item.image);
            onImageLoad();
          }}
          src={tile.item.image}
        />
      )}
      {hasMetadata ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {tile.item.location ? (
            <p className="text-sm font-semibold leading-tight text-white">
              {tile.item.location}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
