import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

/*
|--------------------------------------------------------------------------
| useModalDismiss — close a dialog by clicking outside it, or Escape
|--------------------------------------------------------------------------
|
| Almost none of the dialogs in this app could be dismissed by clicking
| away from them: the only way out was finding the X or Cancel. But a
| dialog holding half-finished input must NOT vanish on a stray click
| either, so dismissal is gated on whether anything would be lost.
|
| USAGE
|
|   const dismiss = useModalDismiss({
|     onClose,
|     isDirty: name !== initialName || password.length > 0,
|   });
|
|   <div className="fixed inset-0 ..." {...dismiss.backdropProps}>
|     <div className="..." {...dismiss.panelProps}>
|
| WHY mousedown AND click
|
| Closing on the backdrop's click alone has a well-known failure: select
| text inside the dialog, drag past its edge, release — the click lands on
| the backdrop and the dialog disappears mid-edit. The gesture only counts
| when it BEGAN on the backdrop too.
*/

export const useModalDismiss = ({
  onClose,
  isDirty = false,
  closeOnEscape = true,
  dirtyMessage = "You have unsaved changes — use Cancel to discard them.",
} = {}) => {
  /* Refs so the listeners never need rebinding as the form changes. */
  const dirtyRef = useRef(isDirty);
  const closeRef = useRef(onClose);
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const attemptClose = useCallback(() => {
    if (dirtyRef.current) {
      /*
       * Refuse rather than prompt. A confirm dialog on top of a dialog is
       * worse than simply not closing, and the Cancel button is right
       * there for a deliberate discard.
       */
      if (dirtyMessage) toast(dirtyMessage, { icon: "✏️" });
      return false;
    }

    closeRef.current?.();
    return true;
  }, [dirtyMessage]);

  useEffect(() => {
    if (!closeOnEscape) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;

      /*
       * Let a native picker or an open select swallow Escape first — the
       * user is closing that, not the dialog.
       */
      if (event.defaultPrevented) return;

      attemptClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [attemptClose, closeOnEscape]);

  const onBackdropMouseDown = useCallback((event) => {
    pressedOnBackdrop.current = event.target === event.currentTarget;
  }, []);

  const onBackdropClick = useCallback(
    (event) => {
      /* Ignore clicks that bubbled up from inside the panel. */
      if (event.target !== event.currentTarget) return;

      /* ...and gestures that merely ENDED here. */
      if (!pressedOnBackdrop.current) return;

      pressedOnBackdrop.current = false;
      attemptClose();
    },
    [attemptClose]
  );

  return {
    attemptClose,

    /* Spread onto the full-screen scrim. */
    backdropProps: {
      onMouseDown: onBackdropMouseDown,
      onClick: onBackdropClick,
    },

    /*
     * Spread onto the dialog panel. Stops a click inside from reaching the
     * scrim in layouts where the panel is not a direct child of it.
     */
    panelProps: {
      onMouseDown: (event) => event.stopPropagation(),
      onClick: (event) => event.stopPropagation(),
    },
  };
};

export default useModalDismiss;
