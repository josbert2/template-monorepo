import type { Metadata } from "next";
import { Colors } from "@clarity/ui/Colors"
import { Button } from "@clarity/design-system/Button"


export const metadata: Metadata = {
  title: "Experiment 07 - Crafted.is",
};

export default function Page() {
  console.log(Button)
  return (
    <div className="min-h-svh flex flex-col">
        <Button href="#" >Button</Button>
        <button className="bg-secondary">
          Button
        </button>
    </div>
  );
}