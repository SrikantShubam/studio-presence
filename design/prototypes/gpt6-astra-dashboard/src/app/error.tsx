"use client";

import { useEffect } from "react";
import { PanelsTopLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/primitives";

export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Workspace could not be loaded:", error); }, [error]);
  return <main className="grid min-h-dvh place-items-center p-6"><section className="w-full max-w-md border border-border p-8"><span className="mb-7 grid size-10 place-items-center bg-primary text-primary-foreground"><PanelsTopLeft /></span><p className="mb-2 text-[11px] text-muted-foreground">Studio Presence</p><h1 className="!text-[23px]">Your desk will be right back.</h1><p className="mb-6 mt-3 text-muted-foreground">We couldn’t load the workspace. Your saved enquiries and website content are safe. Please try again.</p><Button variant="primary" onClick={reset}><RotateCcw />Try again</Button></section></main>;
}
