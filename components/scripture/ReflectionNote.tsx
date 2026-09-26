"use client";

import { useId } from "react";
import { useLocalStore } from "@/lib/useLocalStore";

/**
 * A private journal line under each study question. Saved as you type to this
 * browser only (guarded localStorage) - nothing is sent anywhere, and the page
 * says so. If storage is unavailable it still works as a scratchpad.
 */
export default function ReflectionNote({ noteKey, prompt }: { noteKey: string; prompt: string }) {
  const id = useId();
  const [value, setValue] = useLocalStore(`et-note-${noteKey}`, "");
  return (
    <div className="mt-3">
      <label htmlFor={id} className="sr-only">
        Your reflection on: {prompt}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value || null)}
        rows={2}
        placeholder="Write a thought or a prayer… (private, saved on this device only)"
        className="copy w-full resize-y rounded-xl bg-white/80 p-3 text-sm text-ink ring-1 ring-ink/10 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-scripture"
      />
    </div>
  );
}
