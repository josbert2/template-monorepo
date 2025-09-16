'use client';

import type { Metadata } from "next";
import { Colors } from "@clarity/ui/Colors"
import { Button } from "@clarity/design-system/Button"

import CSSProEditor  from "./CSSpro";

import Header from "../components/Header/Header"
import Hero from "../components/Hero/Hero"

/*export const metadata: Metadata = {
  title: "Experiment 07 - Crafted.is",
};
 */
export default function Page() {

  return (
    <div className="min-h-svh flex flex-col">
        <Header />
        <Hero />
        <CSSProEditor />
    </div>
  );
}