import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

/**
 * How a card is picked up, on the board and on the calendar alike.
 *
 * A mouse drags after 8px of movement, so a click on a card is still a click.
 * A finger has to hold for a quarter of a second first, the way a phone moves
 * anything: without the hold a swipe across the board is a drag, and the page
 * never scrolls. A finger that moves more than 8px during the hold is a scroll
 * and nothing is picked up. The keyboard drag is unchanged.
 */
export function useBoardSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );
}
