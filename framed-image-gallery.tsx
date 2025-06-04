"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
}

export default function FramedImageGallery() {
  const [loaded, setLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);

  // Sample gallery items - using the same image for demonstration
  const galleryItems: GalleryItem[] = [
    {
      id: 0,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Noir Still Life",
      description: "A dramatic composition of light and shadow",
    },
    {
      id: 1,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Classic Composition",
      description: "Timeless elements in perfect harmony",
    },
    {
      id: 2,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Vintage Collection",
      description: "Objects that tell a story",
    },
    {
      id: 3,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Dramatic Lighting",
      description: "Shadows and highlights in perfect balance",
    },
    {
      id: 4,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Artistic Vision",
      description: "A masterpiece of still life photography",
    },
    {
      id: 5,
      src: "/cards/card.jpg",
      alt: "Still life with hat, watch, gun and bottle",
      title: "Cinematic Style",
      description: "Film noir aesthetic captured in time",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const FrameComponent = ({
    item,
    isMain = false,
    isSelected = false,
    onClick,
  }: {
    item: GalleryItem;
    isMain?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
  }) => (
    <div
      className={cn(
        "relative transition-all duration-500 transform cursor-pointer",
        isMain ? "max-w-2xl mx-auto" : "w-full hover:scale-105",
        isSelected && !isMain
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900"
          : "",
        loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}
      onClick={onClick}
    >
      {/* Outer decorative frame */}
      <div
        className={cn(
          "absolute inset-0 border-8 border-amber-700/80 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-br from-amber-800/30 to-amber-950/30 backdrop-blur-sm",
          isMain ? "-m-6" : "-m-2"
        )}
      ></div>

      {/* Inner decorative elements - corners */}
      <div
        className={cn(
          "absolute w-12 h-12 border-t-4 border-l-4 border-amber-500",
          isMain
            ? "-top-3 -left-3"
            : "-top-1 -left-1 w-4 h-4 border-t-2 border-l-2"
        )}
      ></div>
      <div
        className={cn(
          "absolute w-12 h-12 border-t-4 border-r-4 border-amber-500",
          isMain
            ? "-top-3 -right-3"
            : "-top-1 -right-1 w-4 h-4 border-t-2 border-r-2"
        )}
      ></div>
      <div
        className={cn(
          "absolute w-12 h-12 border-b-4 border-l-4 border-amber-500",
          isMain
            ? "-bottom-3 -left-3"
            : "-bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2"
        )}
      ></div>
      <div
        className={cn(
          "absolute w-12 h-12 border-b-4 border-r-4 border-amber-500",
          isMain
            ? "-bottom-3 -right-3"
            : "-bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2"
        )}
      ></div>

      {/* Gold accent lines */}
      <div
        className={cn(
          "absolute inset-0 border border-amber-400/50 rounded-md",
          isMain ? "-m-2" : "-m-1"
        )}
      ></div>

      <Card className="overflow-hidden border-0 rounded-sm shadow-2xl bg-black">
        {/* Image container with subtle inner shadow */}
        <div
          className={cn(
            "relative w-full overflow-hidden shadow-inner",
            isMain ? "aspect-[3/4]" : "aspect-[4/3]"
          )}
        >
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10 pointer-events-none"></div>
          <Image
            src={item.src || "/avatar.jpg"}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes={
              isMain
                ? "(max-width: 768px) 100vw, 700px"
                : "(max-width: 768px) 50vw, 200px"
            }
            priority={isMain}
          />
        </div>

        {/* Caption area */}
        {isMain && (
          <div className="p-4 bg-gradient-to-b from-black to-slate-900 text-center">
            <h3 className="font-serif text-amber-300 text-xl">{item.title}</h3>
            <p className="text-amber-100/80 text-sm mt-1 italic">
              {item.description}
            </p>
          </div>
        )}
      </Card>

      {/* Decorative corner flourishes - only for main */}
      {isMain && (
        <>
          <div className="absolute -top-8 -left-8 w-16 h-16 border-t-2 border-l-2 border-amber-300/50 rounded-tl-lg"></div>
          <div className="absolute -top-8 -right-8 w-16 h-16 border-t-2 border-r-2 border-amber-300/50 rounded-tr-lg"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 border-b-2 border-l-2 border-amber-300/50 rounded-bl-lg"></div>
          <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-2 border-r-2 border-amber-300/50 rounded-br-lg"></div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main display area */}
        <div className="mb-12">
          <FrameComponent item={galleryItems[selectedCard]} isMain={true} />
        </div>

        {/* Thumbnail gallery */}
        <div className="space-y-4">
          <h2 className="text-center text-amber-300 font-serif text-2xl mb-6">
            Gallery Collection
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryItems.map((item, index) => (
              <div key={item.id} className="relative">
                <FrameComponent
                  item={item}
                  isSelected={selectedCard === index}
                  onClick={() => setSelectedCard(index)}
                />
                {/* Thumbnail title */}
                <div className="mt-2 text-center">
                  <p className="text-amber-200 text-xs font-medium truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {galleryItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedCard(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                selectedCard === index
                  ? "bg-amber-400 scale-125"
                  : "bg-amber-700/50 hover:bg-amber-600/70"
              )}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
