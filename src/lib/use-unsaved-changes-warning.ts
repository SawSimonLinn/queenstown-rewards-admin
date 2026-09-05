"use client";

import { useEffect, useRef } from "react";

/**
 * Warns before the tab is closed/reloaded if a form has been edited but not
 * submitted. Forms in this app are plain `<form action={formAction}>` with
 * `useActionState` (react-hook-form is a dependency but unused), so this
 * tracks dirtiness via native `input`/`change` events on the form element
 * rather than a form-library's isDirty flag.
 */
export function useUnsavedChangesWarning<T extends HTMLFormElement>() {
  const formRef = useRef<T>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    function markDirty() {
      dirtyRef.current = true;
    }
    function clearDirty() {
      dirtyRef.current = false;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (dirtyRef.current) event.preventDefault();
    }

    form.addEventListener("input", markDirty);
    form.addEventListener("submit", clearDirty);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("submit", clearDirty);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return formRef;
}
