"use client";

import { motion } from "framer-motion";

function BottleSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* corps */}
      <path
        d="M50 4h20v54c0 6 3 10 8 15 13 12 18 28 18 46v230c0 22-18 40-40 40h-2c-22 0-40-18-40-40V119c0-18 5-34 18-46 5-5 8-9 8-15V4z"
        fill="currentColor"
      />
      {/* muselet / capsule */}
      <path d="M46 0h28v18H46z" fill="currentColor" opacity="0.65" />
      {/* reflet */}
      <path
        d="M40 140c-4 10-6 20-6 30v170c0 14 8 26 19 32-8-8-13-19-13-31V172c0-11 2-22 6-32z"
        fill="white"
        opacity="0.08"
      />
    </svg>
  );
}

const bottles = [
  { top: "-4rem", right: "-1rem", height: "38rem", opacity: "text-vine/[0.07]", delay: 0, duration: 7 },
  { top: "2rem", right: "6rem", height: "34rem", opacity: "text-gold/20", delay: 0.4, duration: 8.5 },
  { top: "6rem", right: "14rem", height: "30rem", opacity: "text-vine/[0.09]", delay: 0.8, duration: 6.5 },
];

export function ChampagneBottles() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 select-none overflow-hidden lg:block"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rotate-12">
        {bottles.map((bottle, index) => (
          <motion.div
            key={index}
            className={cnAbsolute(bottle.opacity)}
            style={{ top: bottle.top, right: bottle.right, height: bottle.height }}
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: [0, -1.4, 0, 1.4, 0],
            }}
            transition={{
              opacity: { duration: 0.9, delay: bottle.delay, ease: "easeOut" },
              y: { duration: 0.9, delay: bottle.delay, ease: "easeOut" },
              rotate: {
                duration: bottle.duration,
                delay: bottle.delay + 0.9,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <BottleSvg className="h-full w-auto" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function cnAbsolute(colorClass: string) {
  return `absolute w-auto origin-bottom ${colorClass}`;
}
