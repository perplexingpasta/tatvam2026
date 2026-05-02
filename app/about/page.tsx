"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function AboutPage() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth, children } = carouselRef.current;
        
        if (children.length > 0) {
          // Determine the width of one step (element width + gap)
          const firstChild = children[0] as HTMLElement;
          let step = firstChild.offsetWidth;
          
          if (children.length > 1) {
            const secondChild = children[1] as HTMLElement;
            step = secondChild.offsetLeft - firstChild.offsetLeft;
          }

          const maxScrollLeft = scrollWidth - clientWidth;
          
          // If scrolled to the end (allowing a small 10px margin of error), reset to start
          if (scrollLeft >= maxScrollLeft - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current.scrollBy({ left: step, behavior: 'smooth' });
          }
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-20 w-full overflow-x-hidden">
      {/* Centrally placed logo */}
      <div className="flex justify-center mb-8 md:mb-16">
        <Image
          src="/logo-350kb.png"
          alt="Tatvam 2026 Logo"
          width={400}
          height={400}
          className="w-48 md:w-100 h-auto drop-shadow-xl"
          priority
        />
      </div>

      {/* Why attend paragraph */}
      <div className="text-center mb-12 md:mb-24 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4 md:mb-6 text-primary tracking-tight">
          Why Attend Tatvam 2026?
        </h2>
        <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-2 md:px-0 mx-auto">
          Experience the most anticipated college cultural fest of the year. Tatvam 2026 brings together the brightest minds, incredible talents, and a vibrant community for a celebration of art, music, technology, and pure excitement. Join us as we redefine boundaries and create memories that will last a lifetime.
        </p>
      </div>

      {/* Image Carousel (Scroll Snap) */}
      <div className="mb-16 md:mb-32">
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 pt-2 no-scrollbar"
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <div 
              key={item} 
              className="snap-center shrink-0 w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] aspect-4/3 sm:aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300"
            >
              <Image
                src="/about.jpg"
                alt={`Tatvam Highlight ${item}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, (max-width: 1024px) 45vw, 35vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-row justify-center items-center gap-2 sm:gap-6 md:gap-12 mb-16 md:mb-32 bg-card/50 backdrop-blur-sm p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-border/50">
        <div className="text-center flex-1">
          <div className="text-2xl sm:text-4xl md:text-6xl font-bold font-heading text-primary mb-1 md:mb-3">10</div>
          <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground font-semibold uppercase tracking-widest">Years of Legacy</div>
        </div>
        <div className="text-2xl sm:text-4xl md:text-6xl font-light text-border/50">|</div>
        <div className="text-center flex-1">
          <div className="text-2xl sm:text-4xl md:text-6xl font-bold font-heading text-primary mb-1 md:mb-3">2500+</div>
          <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground font-semibold uppercase tracking-widest">Participants</div>
        </div>
        <div className="text-2xl sm:text-4xl md:text-6xl font-light text-border/50">|</div>
        <div className="text-center flex-1">
          <div className="text-2xl sm:text-4xl md:text-6xl font-bold font-heading text-primary mb-1 md:mb-3">32</div>
          <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground font-semibold uppercase tracking-widest">Colleges</div>
        </div>
      </div>

      {/* Bottom Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        <div className="relative w-full aspect-square sm:aspect-4/3 lg:aspect-square xl:aspect-4/3 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl order-1 lg:order-1">
          <Image
            src="/about.jpg"
            alt="Tatvam Community"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="order-2 lg:order-2 space-y-4 md:space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-primary tracking-tight">
            Our Riwaayat, Our Story
          </h2>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
            From humble beginnings to becoming the regions premier cultural destination, our journey has been fueled by the unwavering passion of our student body. Every year, we aim higher, pushing the envelope of creativity and inclusivity. 
          </p>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
            Whether you are a competitive dancer, an avid gamer, or someone looking to enjoy the spectacular pro-shows, Tatvam provides a stage for everyone. Because some eras deserve a sequel, and this one is yours to write.
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </main>
  );
}
