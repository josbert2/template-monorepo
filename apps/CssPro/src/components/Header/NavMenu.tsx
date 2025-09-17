"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";

const EASE = [0.22, 1, 0.36, 1] as const;
const popoverAnim = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
  transition: { type: "tween", ease: EASE, duration: 0.18 },
};

type SetActive = React.Dispatch<React.SetStateAction<string | null>>;

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: SetActive;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div
      onMouseEnter={() => setActive(item)}
      onFocus={() => setActive(item)}
      className="relative"
    >
      <motion.p
        transition={{ type: "tween", ease: EASE, duration: 0.12 }}
        className="cursor-pointer text-black hover:opacity-90 dark:text-white"
      >
        {item}
      </motion.p>

      <AnimatePresence>
        {mounted && active === item && (
          <motion.div
            {...popoverAnim}
            className="absolute top-[calc(100%+1.2rem)] left-1/2 -translate-x-1/2 pt-4"
          >
            <div className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/20 dark:border-white/20 shadow-xl">
              <div className="w-max h-full p-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: SetActive;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/20 bg-white shadow-input flex justify-center space-x-4 px-8 py-6"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} prefetch={false} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black"
    >
      {children}
    </Link>
  );
};

// (Opcional) reafirma las exportaciones
export { Menu as _Menu, MenuItem as _MenuItem, ProductItem as _ProductItem, HoveredLink as _HoveredLink };
