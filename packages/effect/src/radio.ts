import { radioGroup } from "@ui-sdk/core/radio"
import { createParts } from "./create-parts"

/**
 * Radios that share one value, with one tab stop and arrow keys between
 * them. Its `view` gets the `group`, and for each radio, its `radio`
 * button, the hidden native `input` beside it, and the `indicator`, from
 * `radioGroup.in("radio", { value })`.
 * @stable
 */
const RadioGroup = createParts(radioGroup, {
  name: "RadioGroup",
  tags: { group: "div", root: "button", input: "input", indicator: "span" },
  names: { root: "radio" },
  present: ["indicator"],
  state: "group",
})

export { createRadioGroupController } from "@ui-sdk/core/radio"
export type {
  RadioGroupApi,
  RadioGroupChangeOptions,
  RadioGroupController,
  RadioGroupOptions,
  RadioGroupPrimitive,
  RadioGroupState,
  RadioGroupValueChangeReason,
  RadioIndicatorProps,
  RadioIndicatorState,
  RadioProps,
  RadioState,
} from "@ui-sdk/core/radio"

export { RadioGroup }
