import {
  checkbox,
  checkboxGroup,
  type CheckboxGroupApi,
  type CheckboxPrimitive,
} from "@ui-sdk/core/checkbox"
import type * as Component from "@effect/ui/Component"
import {
  createParts,
  type EffectEvents,
  type EffectParts,
  type EffectProps,
} from "./create-parts"

const checkboxParts = createParts(checkbox, {
  name: "Checkbox",
  tags: { root: "button", input: "input", indicator: "span" },
  present: ["indicator"],
})

/**
 * A checkbox. Its `view` gets the `root` for its button, the hidden native
 * `input` that takes part in the form, which goes beside the button, and the
 * `indicator` inside it. To join a group, pass its `join` as `group`.
 * @stable
 */
const Checkbox = checkboxParts as unknown as Component.Headless<
  EffectProps<CheckboxPrimitive> & {
    /** The group it joins: a CheckboxGroup's `join`. */
    readonly group?: () => CheckboxGroupApi | undefined
  },
  EffectEvents<CheckboxPrimitive>,
  EffectParts<
    CheckboxPrimitive,
    { root: "button"; input: "input"; indicator: "span" },
    "indicator"
  >
>

/**
 * Checkboxes that share a name and a list of checked values. Its `view` gets
 * the `group` and its hidden native `input`, and `join`, which each checkbox
 * in it takes as `group`.
 * @stable
 */
const CheckboxGroup = createParts(checkboxGroup, {
  name: "CheckboxGroup",
  tags: { group: "div", "group-input": "input" },
  names: { "group-input": "input" },
  state: "group",
})

export {
  createCheckboxController,
  createCheckboxGroupController,
} from "@ui-sdk/core/checkbox"
export type {
  CheckboxApi,
  CheckboxChangeOptions,
  CheckboxCheckedChangeReason,
  CheckboxController,
  CheckboxGroupApi,
  CheckboxGroupChangeOptions,
  CheckboxGroupController,
  CheckboxGroupOptions,
  CheckboxGroupPrimitive,
  CheckboxGroupState,
  CheckboxGroupValueChangeReason,
  CheckboxIndicatorProps,
  CheckboxIndicatorState,
  CheckboxOptions,
  CheckboxPrimitive,
  CheckboxState,
  CheckedState,
} from "@ui-sdk/core/checkbox"

export { Checkbox, CheckboxGroup }
