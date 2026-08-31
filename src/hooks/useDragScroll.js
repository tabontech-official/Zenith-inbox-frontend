import { useCallback, useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| useDragScroll — grab-and-pan a horizontally overflowing row
|--------------------------------------------------------------------------
|
| The scenario flow cards overflow to the right, but the row carried
| `no-scrollbar`, so the only way to reach the cards past the edge was a
| trackpad swipe or shift+wheel — with nothing on screen suggesting either.
|
| This adds the two affordances a wide row needs:
|
|   - click and drag to pan, with a grab cursor
|   - the wheel scrolls the row horizontally while the pointer is over it
|
| CLICKS STILL WORK
|
| The cards open modals, so a drag must not also register as a click. Past
| a few pixels of movement the next click is swallowed in the capture
| phase, before it reaches any card. Below that threshold nothing is
| suppressed, so a normal click behaves normally.
|
| Returns a ref for the scroll container plus flags for styling and for
| showing edge affordances.
*/

const DRAG_THRESHOLD_PX = 5;

export const useDragScroll = () => {
  const ref = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [overflow, setOverflow] = useState({
    scrollable: false,
    atStart: true,
    atEnd: false,
  });

  /* Kept in a ref: these change per pointer event and must not re-render. */
  const state = useRef({
    down: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    /* Set at the end of a pan, to swallow that pan's own click. */
    suppressClick: false,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;

    setOverflow({
      /* 1px of slack — sub-pixel layout produces a phantom overflow. */
      scrollable: max > 1,
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft >= max - 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    measure();

    el.addEventListener("scroll", measure, { passive: true });

    /*
     * Cards appear and disappear as the scenario loads, so the row's width
     * changes after mount. ResizeObserver is not in every environment the
     * app is rendered in (jsdom, older embedded views), hence the guard.
     */
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(el);
      Array.from(el.children).forEach((child) => observer.observe(child));
    }

    window.addEventListener("resize", measure);

    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [measure]);

  const onPointerDown = useCallback((event) => {
    const el = ref.current;
    if (!el) return;

    /* Left button only; ignore right-click and middle-click. */
    if (event.button !== 0) return;

    /*
     * Let form controls keep their own pointer behaviour — dragging to
     * select text in an input should not pan the row.
     */
    if (event.target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    state.current = {
      down: true,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
      /*
       * A new gesture always starts un-suppressed. Without this, a pan
       * that ended without producing a click left the flag set and ate
       * the next real click on a card.
       */
      suppressClick: false,
    };

    /*
     * Deliberately NO setPointerCapture here.
     *
     * While a pointer is captured the browser retargets the resulting
     * click to the capturing element, so a plain click on a card was
     * delivered to this container instead and the card's onClick never
     * ran. Capture is claimed in onPointerMove, once movement proves the
     * gesture is a drag rather than a click.
     */
  }, []);

  const onPointerMove = useCallback((event) => {
    const el = ref.current;
    if (!el || !state.current.down) return;

    const delta = event.clientX - state.current.startX;

    if (!state.current.moved && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      state.current.moved = true;
      setIsDragging(true);

      /*
       * Claimed only now that this is definitely a drag: it keeps the pan
       * alive when the cursor leaves the row, without stealing the click
       * target from a card the user merely tapped.
       */
      if (el.setPointerCapture && event.pointerId !== undefined) {
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
    }

    if (!state.current.moved) return;

    /* Prevents the browser's own text selection while panning. */
    event.preventDefault();

    el.scrollLeft = state.current.startScrollLeft - delta;
  }, []);

  const endDrag = useCallback((event) => {
    const el = ref.current;

    if (el?.releasePointerCapture && event?.pointerId !== undefined) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        /* nothing captured */
      }
    }

    /* Only the click belonging to THIS pan is suppressed. */
    state.current.suppressClick = state.current.moved;
    state.current.moved = false;
    state.current.down = false;
    setIsDragging(false);
  }, []);

  /*
   * Runs in the CAPTURE phase, so the click a pan produces is stopped
   * before it reaches a card's onClick. The flag is set on pointer-up and
   * cleared here (and on the next pointer-down), so exactly one click is
   * ever suppressed and a plain click is never affected.
   */
  const onClickCapture = useCallback((event) => {
    if (!state.current.suppressClick) return;

    state.current.suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /*
   * A vertical wheel over a horizontal row should move it sideways —
   * otherwise the page scrolls and the row never moves. Deferred to the
   * browser when the row is already at the edge in that direction, so the
   * page can still scroll past it.
   */
  const onWheel = useCallback((event) => {
    const el = ref.current;
    if (!el) return;

    /* A horizontal wheel/trackpad gesture already does the right thing. */
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    const max = el.scrollWidth - el.clientWidth;
    if (max <= 1) return;

    const next = el.scrollLeft + event.deltaY;

    if (
      (event.deltaY < 0 && el.scrollLeft <= 0) ||
      (event.deltaY > 0 && el.scrollLeft >= max)
    ) {
      return;
    }

    event.preventDefault();
    el.scrollLeft = Math.max(0, Math.min(max, next));
  }, []);

  /*
   * React attaches wheel listeners passively, which makes
   * event.preventDefault() a no-op there. Bind it directly instead.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  /*
   * If a pointerup happens somewhere capture did not deliver (an alt-tab, a
   * release over a different window), the drag would otherwise stay stuck
   * on and keep panning on the next mouse move.
   */
  useEffect(() => {
    const stop = () => {
      if (!state.current.down) return;
      state.current.suppressClick = state.current.moved;
      state.current.moved = false;
      state.current.down = false;
      setIsDragging(false);
    };

    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);

    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);

  /* Scrolls by roughly one card, for the edge buttons. */
  const scrollBy = useCallback((direction) => {
    const el = ref.current;
    if (!el) return;

    el.scrollBy({
      left: direction * Math.max(240, el.clientWidth * 0.7),
      behavior: "smooth",
    });
  }, []);

  return {
    ref,
    isDragging,
    overflow,
    scrollBy,
    /* Spread onto the scroll container. */
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      /*
       * Deliberately no onPointerLeave: it ended the pan as soon as the
       * cursor crossed the row's edge, which is why dragging stopped
       * around the middle of the screen. Release is handled by pointer
       * capture, with the window listener below as the backstop.
       */
      onClickCapture,
      style: { cursor: isDragging ? "grabbing" : "grab" },
    },
  };
};

export default useDragScroll;
