import { component$, Slot, useStyles$, useSignal } from '@builder.io/qwik';
import { Carousel as HeadlessCarousel } from '@qwik-ui/headless';
import { cn } from '../utils';

// Optional: Add carousel-specific CSS
const carouselStyles = `
  .carousel-root {
    position: relative;
    width: 100%;
    margin: 0 auto;
  }
  
  .carousel-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  
  .carousel-scroller {
    overflow: hidden;
  }
  
  .carousel-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsl(var(--muted));
    border-radius: var(--border-radius);
    color: hsl(var(--muted-foreground));
    height: 160px;
    text-transform: capitalize;
    font-weight: 500;
  }
  
  .carousel-animation {
    transition: 0.35s transform cubic-bezier(0.57, 0.16, 0.95, 0.67);
  }
  
  .carousel-pagination {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .carousel-pagination button {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: hsl(var(--muted));
    border: none;
    padding: 0;
    cursor: pointer;
  }
  
  .carousel-pagination button[data-active] {
    background-color: hsl(var(--primary));
  }
`;

export const Carousel = {
  Root: component$<{
    class?: string;
    gap?: number;
    slidesPerView?: number;
    draggable?: boolean;
    align?: 'start' | 'center' | 'end';
    rewind?: boolean;
    startIndex?: number;
    autoPlayIntervalMs?: number;
    move?: number;
    orientation?: 'horizontal' | 'vertical';
    maxSlideHeight?: number;
    mousewheel?: boolean;
  }>(({
    class: className,
    gap = 30,
    slidesPerView = 1,
    draggable = true,
    align = 'start',
    rewind = false,
    startIndex = 0,
    autoPlayIntervalMs = 5000,
    move = 1,
    orientation = 'horizontal',
    maxSlideHeight,
    mousewheel = false,
  }) => {
    useStyles$(carouselStyles);
    const autoplay = useSignal(false);
    const progress = useSignal(0);
    const selectedIndex = useSignal(startIndex);

    return (
      <HeadlessCarousel.Root
        class={cn('carousel-root', className)}
        gap={gap}
        slidesPerView={slidesPerView}
        draggable={draggable}
        align={align}
        rewind={rewind}
        bind:selectedIndex={selectedIndex}
        bind:autoplay={autoplay}
        bind:progress={progress}
        autoPlayIntervalMs={autoPlayIntervalMs}
        move={move}
        orientation={orientation}
        maxSlideHeight={maxSlideHeight}
        mousewheel={mousewheel}
      >
        <Slot />
      </HeadlessCarousel.Root>
    );
  }),

  Scroller: component$<{ class?: string }>(({ class: className }) => {
    return (
      <HeadlessCarousel.Scroller class={cn('carousel-scroller carousel-animation', className)}>
        <Slot />
      </HeadlessCarousel.Scroller>
    );
  }),

  Slide: component$<{ class?: string; key?: string }>(({ class: className, key }) => {
    return (
      <HeadlessCarousel.Slide key={key} class={cn('carousel-slide', className)}>
        <Slot />
      </HeadlessCarousel.Slide>
    );
  }),

  Previous: component$<{ class?: string }>(({ class: className }) => {
    return (
      <HeadlessCarousel.Previous
        class={cn(
          'px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
      >
        <Slot />
      </HeadlessCarousel.Previous>
    );
  }),

  Next: component$<{ class?: string }>(({ class: className }) => {
    return (
      <HeadlessCarousel.Next
        class={cn(
          'px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
      >
        <Slot />
      </HeadlessCarousel.Next>
    );
  }),

  Pagination: component$<{ class?: string }>(({ class: className }) => {
    return (
      <HeadlessCarousel.Pagination class={cn('carousel-pagination', className)}>
        <Slot />
      </HeadlessCarousel.Pagination>
    );
  }),

  Bullet: component$<{ class?: string }>(({ class: className }) => {
    return <HeadlessCarousel.Bullet class={cn(className)} />;
  }),

  Title: component$<{ class?: string }>(({ class: className }) => {
    return (
      <h2 class={cn('text-xl font-bold mb-4', className)}>
        <HeadlessCarousel.Title>
          <Slot />
        </HeadlessCarousel.Title>
      </h2>
    );
  }),
};