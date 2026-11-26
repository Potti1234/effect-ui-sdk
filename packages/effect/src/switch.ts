import { switchPrimitive } from "@ui-sdk/core/switch"
import { createParts } from "./create-parts"

/**
 * A switch that turns a setting on or off. Its `view` gets the `root` for
 * its button, the hidden native `input` that takes part in the form, which
 * goes beside the button, and the `thumb` inside it.
 * @stable
 */
const Switch = createParts(switchPrimitive, {
  name: "Switch",
  tags: { root: "button", input: "input", thumb: "span" },
})

export { createSwitchController } from "@ui-sdk/core/switch"
export type {
  SwitchApi,
  SwitchCheckedChangeReason,
  SwitchController,
  SwitchOptions,
  SwitchPrimitive,
  SwitchState,
  SwitchThumbState,
} from "@ui-sdk/core/switch"

export { Switch }
