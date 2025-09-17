'use client';
import { useState } from "react";
import Button from "../CTA/Button";
import * as Nav from "./NavMenu";            // <- namespace import, imposible que quede undefined
import { cn } from "@clarity/utils/cn";

export default function Header() {
  const logo = 'https://fortify-astro.vercel.app/_astro/logo.K2OIZQC9_T1ydc.svg';

  return (
    <header className="flex justify-between items-center px-6 py-6 container mx-auto">
      <img src={logo} alt="Logo" />
      <div>
        <Navbar className="top-2" />
      </div>
      <div>
        <Button />
      </div>
    </header>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}>
      <Nav.Menu setActive={setActive}>
        <Nav.MenuItem setActive={setActive} active={active} item="All pages">
          <div className="flex flex-col space-y-4 text-sm">
            <Nav.HoveredLink href="/web-dev">Web Development</Nav.HoveredLink>
            <Nav.HoveredLink href="/interface-design">Interface Design</Nav.HoveredLink>
            <Nav.HoveredLink href="/seo">Search Engine Optimization</Nav.HoveredLink>
            <Nav.HoveredLink href="/branding">Branding</Nav.HoveredLink>
          </div>
        </Nav.MenuItem>

        <Nav.MenuItem setActive={setActive} active={active} item="Feature">
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
            <Nav.ProductItem
              title="Algochurn"
              href="https://algochurn.com"
              src="https://assets.aceternity.com/demos/algochurn.webp"
              description="Prepare for tech interviews like never before."
            />
            <Nav.ProductItem
              title="Tailwind Master Kit"
              href="https://tailwindmasterkit.com"
              src="https://assets.aceternity.com/demos/tailwindmasterkit.webp"
              description="Production ready Tailwind css components for your next project"
            />
            <Nav.ProductItem
              title="Moonbeam"
              href="https://gomoonbeam.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.51.31%E2%80%AFPM.png"
              description="Never write from scratch again. Go from idea to blog in minutes."
            />
            <Nav.ProductItem
              title="Rogue"
              href="https://userogue.com"
              src="https://assets.aceternity.com/demos/Screenshot+2024-02-21+at+11.47.07%E2%80%AFPM.png"
              description="Respond to government RFPs, RFIs and RFQs 10x faster using AI"
            />
          </div>
        </Nav.MenuItem>

        <Nav.MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-4 text-sm">
            <Nav.HoveredLink href="/hobby">Hobby</Nav.HoveredLink>
            <Nav.HoveredLink href="/individual">Individual</Nav.HoveredLink>
            <Nav.HoveredLink href="/team">Team</Nav.HoveredLink>
            <Nav.HoveredLink href="/enterprise">Enterprise</Nav.HoveredLink>
          </div>
        </Nav.MenuItem>
        <Nav.MenuItem setActive={setActive} active={active} item="Contact">
          <div className="flex flex-col space-y-4 text-sm">
            <Nav.HoveredLink href="/hobby">Hobby</Nav.HoveredLink>
            <Nav.HoveredLink href="/individual">Individual</Nav.HoveredLink>
            <Nav.HoveredLink href="/team">Team</Nav.HoveredLink>
            <Nav.HoveredLink href="/enterprise">Enterprise</Nav.HoveredLink>
          </div>
        </Nav.MenuItem>
      </Nav.Menu>
    </div>
  );
}
