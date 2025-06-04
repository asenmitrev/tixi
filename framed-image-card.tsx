"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function FramedImageCard() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-8">
      <div
        className={cn(
          "transition-all duration-1000 transform",
          loaded ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="relative max-w-2xl mx-auto">
          {/* Outer decorative frame */}
          <div className="absolute inset-0 -m-6 border-8 border-amber-700/80 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-br from-amber-800/30 to-amber-950/30 backdrop-blur-sm"></div>

          {/* Inner decorative elements - corners */}
          <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-amber-500"></div>
          <div className="absolute -top-3 -right-3 w-12 h-12 border-t-4 border-r-4 border-amber-500"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-4 border-l-4 border-amber-500"></div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-amber-500"></div>

          {/* Gold accent lines */}
          <div className="absolute inset-0 -m-2 border border-amber-400/50 rounded-md"></div>

          <Card className="overflow-hidden border-0 rounded-sm shadow-2xl bg-black">
            {/* Image container with subtle inner shadow */}
            <div className="relative w-full aspect-[2/3] overflow-hidden shadow-inner">
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10 pointer-events-none"></div>
              <Image
                src="/cards/card.jpg"
                alt="Still life with hat, watch, gun and bottle"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Card>

          {/* Decorative corner flourishes */}
          <div className="absolute -top-8 -left-8 w-16 h-16 border-t-2 border-l-2 border-amber-300/50 rounded-tl-lg"></div>
          <div className="absolute -top-8 -right-8 w-16 h-16 border-t-2 border-r-2 border-amber-300/50 rounded-tr-lg"></div>
          <div className="absolute -bottom-8 -left-8 w-16 h-16 border-b-2 border-l-2 border-amber-300/50 rounded-bl-lg"></div>
          <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-2 border-r-2 border-amber-300/50 rounded-br-lg"></div>
        </div>
      </div>
    </div>
  );
}
