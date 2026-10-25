import type { Variants } from 'motion/react';
import { type HTMLMotionProps, motion, useInView, useReducedMotion } from 'motion/react';
import type React from 'react';

type TimelineContentProps<T extends keyof HTMLElementTagNameMap> = {
  children?: React.ReactNode;
  animationNum: number;
  className?: string;
  timelineRef: React.RefObject<HTMLElement | null>;
  as?: T;
  customVariants?: Variants;
  once?: boolean;
} & HTMLMotionProps<T>;

export const TimelineAnimation = <T extends keyof HTMLElementTagNameMap = 'div'>({
  children,
  animationNum,
  timelineRef,
  className,
  as,
  customVariants,
  once = true,
  ...props
}: TimelineContentProps<T>) => {
  const defaultSequenceVariants = {
    visible: (i: number) => ({
      filter: 'blur(0px)',
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: 'blur(20px)',
      y: 0,
      opacity: 0,
    },
  };

  const sequenceVariants = customVariants || defaultSequenceVariants;

  const isInView = useInView(timelineRef, {
    once,
  });

  // Honour the OS "reduce motion" preference: render the final state instantly
  // instead of staggering blur/opacity entrances. The final state is passed
  // explicitly so the server-rendered hidden styles are replaced, not left
  // behind.
  const reduceMotion = useReducedMotion();

  const MotionComponent = motion[as || 'div'] as React.ElementType;

  return (
    <MotionComponent
      data-timeline-animation=""
      initial={reduceMotion ? false : 'hidden'}
      animate={
        reduceMotion
          ? { opacity: 1, filter: 'blur(0px)' }
          : isInView
            ? 'visible'
            : 'hidden'
      }
      custom={animationNum}
      variants={reduceMotion ? undefined : sequenceVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
