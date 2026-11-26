import { button } from "@ui-sdk/core/button"
import { createParts } from "./create-parts"

/**
 * A button, or a link or any element that acts as one: apply its `root` to
 * the builder you render. Its `action` prop runs when it's pressed, never
 * while it's disabled or pending, with `details.source` saying how. Return a
 * Promise to make it pending until it settles: it gets `aria-busy`,
 * `aria-disabled` and `data-pending`, keeps focus, ignores presses
 * meanwhile, and says `pendingAnnouncement` after a second.
 * @stable
 */
const Button = createParts(button, {
  name: "Button",
  tags: { root: "button" },
})

export type {
  ButtonActionDetails,
  ButtonApi,
  ButtonOptions,
  ButtonPrimitive,
  ButtonState,
} from "@ui-sdk/core/button"

export { Button }
