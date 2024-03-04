import { Vector2 } from "./Vector2";

export type EventWithClientXY =
  | MouseEvent
  | TouchEvent
  | React.MouseEvent
  | React.TouchEvent;

/** Get the x coordinate of a mouse or touch event. */
export function eventX(event: EventWithClientXY) {
  return "clientX" in event ? event.clientX : event.touches[0].clientX;
}

/** Get the y coordinate of a mouse or touch event. */
export function eventY(event: EventWithClientXY) {
  return "clientY" in event ? event.clientY : event.touches[0].clientY;
}

export function eventXY(event: EventWithClientXY) {
  return new Vector2(eventX(event), eventY(event));
}
