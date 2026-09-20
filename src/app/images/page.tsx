"use client";

import axios from "axios";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ExpandedImageView from "@/components/images/expanded-image-view";
import ImagePlane from "@/components/images/image-plane";
import {
  EDGE_GAP,
  EXPANDED_IMAGE_CLOSE_MS,
  GAP,
  INITIAL_GALLERY_LAYOUT,
  SKELETON_ASPECT_RATIOS,
} from "@/constants/images";
import type {
  ExpandedImage,
  GalleryItem,
  GalleryLayout,
  GalleryTile,
  XY,
} from "@/types/image";
import {
  fitImageRect,
  getColumnCount,
  pickItemIndex,
  toBounds,
  wrap,
} from "@/utils/image.helpers";

export default function Images() {
  const planeRef = useRef<HTMLDivElement>(null);
  const expandedImageRef = useRef<HTMLDivElement>(null);
  const columnHeightsRef = useRef<number[]>([]);
  const current = useRef<XY>({ x: 0, y: 0 });
  const target = useRef<XY>({ x: 0, y: 0 });
  const dragStart = useRef<XY>({ x: 0, y: 0 });
  const targetStart = useRef<XY>({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const pressedTile = useRef<HTMLElement | null>(null);
  const [activeDrag, setActiveDrag] = useState(false);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);
  const [expandedImage, setExpandedImage] = useState<ExpandedImage | null>(
    null,
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [layout, setLayout] = useState<GalleryLayout>(INITIAL_GALLERY_LAYOUT);

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get<{
        images: Array<{
          imageUrl: string;
          description: string | null;
          location: { name: string } | null;
        }>;
      }>("/api/infinite-images", { signal: controller.signal })
      .then(({ data }) => {
        const uniqueImages = Array.from(
          new Map(data.images.map((image) => [image.imageUrl, image])).values(),
        );

        setGalleryItems(
          uniqueImages.map((image) => ({
            image: image.imageUrl,
            location: image.location?.name,
          })),
        );
        setLoadError(null);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setLoadError("Unable to load images.");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const columns = getColumnCount();
      const colWidth =
        (window.innerWidth - EDGE_GAP * 2 - GAP * (columns - 1)) / columns;
      const sheetWidth = columns * colWidth + GAP * (columns - 1);
      const itemsPerColumn = Math.max(
        10,
        Math.ceil(window.innerHeight / colWidth) * 3,
      );

      setLayout((currentLayout) => ({
        colWidth,
        columns,
        itemsPerColumn,
        sheetHeight: Math.max(
          currentLayout.sheetHeight,
          window.innerHeight * 2,
        ),
        sheetWidth,
      }));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const columns = useMemo(() => {
    const items = isLoading
      ? SKELETON_ASPECT_RATIOS.map((aspectRatio) => ({
          aspectRatio,
          image: "",
        }))
      : galleryItems;

    if (!items.length) return [];

    return Array.from({ length: layout.columns }, (_, col) => {
      return Array.from({ length: layout.itemsPerColumn }, (_, index) => {
        const itemIndex = pickItemIndex(
          col,
          index,
          layout.columns,
          items.length,
        );

        return {
          id: `${col}-${index}`,
          item: items[itemIndex],
          itemIndex,
        } satisfies GalleryTile;
      });
    });
  }, [galleryItems, isLoading, layout.columns, layout.itemsPerColumn]);

  useLayoutEffect(() => {
    const measureColumns = () => {
      setLayout((currentLayout) => {
        const measuredColumns = Array.from(
          document.querySelectorAll<HTMLElement>("[data-measured-column]"),
        );
        const nextColumnHeights = Array.from(
          { length: currentLayout.columns },
          (_, col) => {
            const measuredColumn = measuredColumns.find(
              (column) => Number(column.dataset.measuredColumn) === col,
            );

            return measuredColumn
              ? Math.ceil(measuredColumn.getBoundingClientRect().height)
              : currentLayout.sheetHeight;
          },
        );
        const sheetHeight = Math.max(...nextColumnHeights);

        columnHeightsRef.current = nextColumnHeights;
        setColumnHeights((currentHeights) => {
          const hasChanged =
            currentHeights.length !== nextColumnHeights.length ||
            currentHeights.some((height, index) => {
              return Math.abs(height - nextColumnHeights[index]) >= 1;
            });

          return hasChanged ? nextColumnHeights : currentHeights;
        });

        if (Math.abs(currentLayout.sheetHeight - sheetHeight) < 1) {
          return currentLayout;
        }

        return {
          ...currentLayout,
          sheetHeight,
        };
      });
    };

    measureColumns();

    const resizeObserver = new ResizeObserver(measureColumns);

    document
      .querySelectorAll<HTMLElement>("[data-measured-column]")
      .forEach((column) => resizeObserver.observe(column));

    return () => resizeObserver.disconnect();
  }, [columns]);

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.16;
      current.current.y += (target.current.y - current.current.y) * 0.16;

      const x = EDGE_GAP + wrap(current.current.x, layout.sheetWidth + GAP);

      if (planeRef.current) {
        planeRef.current.style.transform = `translate3d(${x}px, 0, 0)`;

        planeRef.current
          .querySelectorAll<HTMLElement>("[data-column-track]")
          .forEach((column) => {
            const col = Number(column.dataset.columnTrack);
            const columnHeight =
              columnHeightsRef.current[col] || layout.sheetHeight;
            const staggerOffset = col % 2 === 1 ? columnHeight * 0.25 : 0;
            const y =
              EDGE_GAP +
              wrap(current.current.y + staggerOffset, columnHeight + GAP);

            column.style.transform = `translate3d(0, ${y}px, 0)`;
          });
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [layout.sheetHeight, layout.sheetWidth]);

  const expandTile = useCallback((item: GalleryItem, element: HTMLElement) => {
    if (hasDragged.current) return;

    setExpandedImage({
      imageRect: toBounds(element.getBoundingClientRect()),
      isClosing: false,
      isOpen: false,
      item,
      targetRect: null,
    });
  }, []);

  const handleDragEnd = useCallback(
    (pointerId?: number, element?: HTMLElement) => {
      if (pointerId !== undefined && element?.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }

      const tileElement = pressedTile.current;

      isDragging.current = false;
      pressedTile.current = null;
      setActiveDrag(false);

      if (!hasDragged.current && tileElement) {
        const itemIndex = Number(tileElement.dataset.itemIndex);

        if (Number.isInteger(itemIndex) && galleryItems[itemIndex]) {
          expandTile(galleryItems[itemIndex], tileElement);
        }
      }
    },
    [expandTile, galleryItems],
  );

  const closeExpandedImage = useCallback(() => {
    setExpandedImage((currentImage) => {
      if (!currentImage) return null;

      return {
        ...currentImage,
        isClosing: true,
        isOpen: false,
      };
    });

    window.setTimeout(() => setExpandedImage(null), EXPANDED_IMAGE_CLOSE_MS);
  }, []);

  const handleTileKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, item: GalleryItem) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      expandTile(item, event.currentTarget);
    },
    [expandTile],
  );

  const handleImageLoad = useCallback(() => {
    setLayout((currentLayout) => ({ ...currentLayout }));
  }, []);

  useLayoutEffect(() => {
    if (!expandedImage || expandedImage.isOpen || expandedImage.isClosing) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const targetSlot = expandedImageRef.current?.getBoundingClientRect();

      if (!targetSlot) return;

      setExpandedImage((currentImage) => {
        if (!currentImage) return null;

        return {
          ...currentImage,
          isClosing: false,
          isOpen: true,
          targetRect: fitImageRect(
            targetSlot,
            currentImage.imageRect.width / currentImage.imageRect.height,
          ),
        };
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [expandedImage]);

  useEffect(() => {
    if (!expandedImage) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpandedImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeExpandedImage, expandedImage]);

  return (
    <main
      className={`relative h-dvh w-dvw touch-none overflow-hidden bg-background text-foreground ${
        activeDrag ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={(event) => {
        if (expandedImage) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = { x: event.clientX, y: event.clientY };
        targetStart.current = { ...target.current };
        isDragging.current = true;
        hasDragged.current = false;
        pressedTile.current = (event.target as Element).closest<HTMLElement>(
          "[data-item-index]",
        );
        setActiveDrag(true);
      }}
      onPointerMove={(event) => {
        if (!isDragging.current) return;

        if (
          Math.hypot(
            event.clientX - dragStart.current.x,
            event.clientY - dragStart.current.y,
          ) > 6
        ) {
          hasDragged.current = true;
        }

        target.current = {
          x: targetStart.current.x + event.clientX - dragStart.current.x,
          y: targetStart.current.y + event.clientY - dragStart.current.y,
        };
      }}
      onPointerUp={(event) =>
        handleDragEnd(event.pointerId, event.currentTarget)
      }
      onPointerCancel={(event) =>
        handleDragEnd(event.pointerId, event.currentTarget)
      }
      onWheel={(event) => {
        if (expandedImage) return;

        target.current = {
          x: target.current.x - event.deltaX,
          y: target.current.y - event.deltaY,
        };
      }}
    >
      <ImagePlane
        columnHeights={columnHeights}
        columns={columns}
        isLoading={isLoading}
        layout={layout}
        onImageLoad={handleImageLoad}
        onTileKeyDown={handleTileKeyDown}
        planeRef={planeRef}
      />

      {!isLoading && loadError ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">
          {loadError}
        </div>
      ) : null}

      {!isLoading && !loadError && !galleryItems.length ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">
          No images yet.
        </div>
      ) : null}

      {expandedImage ? (
        <ExpandedImageView
          expandedImage={expandedImage}
          expandedImageRef={expandedImageRef}
          onClose={closeExpandedImage}
        />
      ) : null}
    </main>
  );
}
