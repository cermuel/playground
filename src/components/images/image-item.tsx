"use client";

import type { KeyboardEvent } from "react";
import type { GalleryItem, GalleryTile } from "@/types/image";
import { getItemLabel, hasItemMetadata } from "@/utils/image.helpers";

type ImageItemProps = {
  maxHeight: number;
  onImageLoad: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, item: GalleryItem) => void;
  tile: GalleryTile;
  width: number;
};

export default function ImageItem({
  maxHeight,
  onImageLoad,
  onKeyDown,
  tile,
  width,
}: ImageItemProps) {
  const itemLabel = getItemLabel(tile.item);
  const hasMetadata = hasItemMetadata(tile.item);

  return (
    <figure
      aria-label={itemLabel || "Open image"}
      className="group relative overflow-hidden rounded-xl bg-zinc-200 outline outline-black/10 transition-transform duration-150 active:scale-[0.96] dark:bg-zinc-800 dark:outline-white/10"
      data-item-index={tile.itemIndex}
      onKeyDown={(event) => onKeyDown(event, tile.item)}
      role="button"
      tabIndex={0}
      style={{
        maxHeight,
        width,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="block h-auto w-full select-none"
        draggable={false}
        onLoad={onImageLoad}
        src={tile.item.image}
      />
      {hasMetadata ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {tile.item.description ? (
            <p className="text-sm font-semibold leading-tight text-white">
              {tile.item.description}
            </p>
          ) : null}
          {tile.item.location ? (
            <p className="mt-1 text-xs text-white/75">{tile.item.location}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
