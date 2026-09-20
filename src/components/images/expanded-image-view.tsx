"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { RefObject, useLayoutEffect, useRef } from "react";
import type { ExpandedImage } from "@/types/image";
import {
  getExpandedImageTransform,
  getItemLabel,
  hasItemMetadata,
} from "@/utils/image.helpers";

type ExpandedImageViewProps = {
  expandedImage: ExpandedImage;
  expandedImageRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
};

export default function ExpandedImageView({
  expandedImage,
  expandedImageRef,
  onClose,
}: ExpandedImageViewProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const metadataRef = useRef<HTMLElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const expandedImageLabel = getItemLabel(expandedImage.item);
  const hasExpandedMetadata = hasItemMetadata(expandedImage.item);

  useLayoutEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("image", "0.9, 0, 0.1, 1");

    const imageFrame = imageFrameRef.current;
    const backdrop = backdropRef.current;
    const closeButton = closeButtonRef.current;
    const metadata = metadataRef.current;
    const isOpen = expandedImage.isOpen && expandedImage.targetRect;

    gsap.to(imageFrame, {
      duration: 0.5,
      ease: "image",
      overwrite: true,
      transform: isOpen
        ? getExpandedImageTransform(expandedImage)
        : "translate3d(0, 0, 0) scale(1)",
    });

    gsap.to(backdrop, {
      duration: expandedImage.isOpen ? 0.3 : 0.2,
      ease: "power2.out",
      opacity: expandedImage.isOpen ? 1 : 0,
      overwrite: true,
    });

    gsap.to(closeButton, {
      duration: 0.15,
      ease: "power2.out",
      opacity: expandedImage.isOpen ? 1 : 0,
      overwrite: true,
    });

    gsap.to(metadata, {
      delay: expandedImage.isOpen ? 0.15 : 0,
      duration: 0.3,
      ease: "power2.out",
      opacity: expandedImage.isOpen ? 1 : 0,
      overwrite: true,
      y: expandedImage.isOpen ? 0 : 8,
    });

    return () => {
      gsap.killTweensOf([imageFrame, backdrop, closeButton, metadata]);
    };
  }, [expandedImage]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[60] cursor-auto overflow-hidden text-zinc-950 dark:text-white"
      aria-label={expandedImageLabel || "Expanded image"}
      role="dialog"
    >
      <button
        ref={closeButtonRef}
        aria-label="Close expanded image"
        className="absolute right-4 top-4 z-30 grid size-11 place-items-center rounded-full bg-white/85 text-2xl leading-none text-zinc-950 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.12)] outline outline-black/10 transition-transform duration-150 active:scale-[0.96] dark:bg-zinc-950/80 dark:text-white dark:outline-white/10"
        onClick={onClose}
        type="button"
      >
        ×
      </button>

      <div
        ref={backdropRef}
        className="pointer-events-none absolute inset-0 bg-white/78 opacity-0 backdrop-blur-xl dark:bg-zinc-950/78"
      />

      <section
        className={`grid h-full w-full gap-6 px-5 pb-8 pt-16 md:grid-rows-[minmax(0,62vh)_auto] lg:grid-rows-1 lg:items-center lg:px-[6vw] lg:py-[10vh] ${
          hasExpandedMetadata
            ? "grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:gap-12"
            : "grid-rows-1 lg:grid-cols-1"
        }`}
      >
        <div
          ref={expandedImageRef}
          className="h-full min-h-0 rounded-2xl lg:h-[80vh]"
          aria-hidden="true"
        />

        {hasExpandedMetadata ? (
          <aside
            ref={metadataRef}
            className="max-w-xl translate-y-2 opacity-0"
          >
            {expandedImage.item.location ? (
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                {expandedImage.item.location}
              </p>
            ) : null}
            {expandedImage.item.description ? (
              <h1
                className={`text-4xl font-semibold leading-none tracking-normal text-zinc-950 dark:text-white md:text-5xl ${
                  expandedImage.item.location ? "mt-3" : ""
                }`}
              >
                {expandedImage.item.description}
              </h1>
            ) : null}
          </aside>
        ) : null}
      </section>

      <div
        ref={imageFrameRef}
        className="fixed z-20 origin-top-left overflow-hidden rounded-xl bg-zinc-200 shadow-[0_24px_80px_rgba(0,0,0,0.18)] outline outline-black/10 will-change-transform dark:bg-zinc-800 dark:outline-white/10"
        style={{
          height: expandedImage.imageRect.height,
          left: expandedImage.imageRect.left,
          top: expandedImage.imageRect.top,
          transform: "translate3d(0, 0, 0) scale(1)",
          width: expandedImage.imageRect.width,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full select-none object-cover"
          draggable={false}
          src={expandedImage.item.image}
        />
      </div>
    </div>
  );
}
