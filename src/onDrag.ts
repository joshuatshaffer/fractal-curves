import * as React from "react";

function noop() {
  // Do nothing.
}

const moveEvents = ["mousemove", "touchmove"] as const;

const endEvents = ["mouseup", "touchend"] as const;

/**
 * Note: Any element that uses this hook must have `touch-action: none` set in CSS.
 */
export function onDrag<T extends Element>(
  onDragStart: (event: React.MouseEvent<T> | React.TouchEvent<T>) =>
    | {
        onDragMove?: (event: MouseEvent | TouchEvent) => void;
        onDragEnd?: (event: MouseEvent | TouchEvent) => void;
      }
    | undefined
) {
  const start = (event: React.MouseEvent<T> | React.TouchEvent<T>) => {
    if (window.getComputedStyle(event.currentTarget).touchAction !== "none") {
      console.error(
        "onDrag requires style `touch-action: none` to be set on the element."
      );
    }

    const { onDragMove = noop, onDragEnd = noop } = onDragStart(event) ?? {};

    const end = (event: MouseEvent | TouchEvent) => {
      onDragEnd(event);

      // Cleanup all event listeners.
      for (const moveEvent of moveEvents) {
        document.removeEventListener(moveEvent, onDragMove);
      }
      for (const endEvent of endEvents) {
        document.removeEventListener(endEvent, end);
      }
    };

    for (const moveEvent of moveEvents) {
      document.addEventListener(moveEvent, onDragMove);
    }
    for (const endEvent of endEvents) {
      document.addEventListener(endEvent, end, { once: true });
    }
  };

  return {
    onMouseDown: (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      start(event);
    },
    onTouchStart: (event) => {
      if (event.touches.length !== 1) {
        return;
      }

      event.stopPropagation();

      start(event);
    },
  } satisfies React.DOMAttributes<T>;
}
