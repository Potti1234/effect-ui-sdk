import { meter } from "@ui-sdk/core/meter"
import { createParts } from "./create-parts"

/**
 * A meter, for a reading within a known range, like storage used. Its
 * `view` gets the `root`, which is the meter, the `track` the `indicator`
 * fills, the `label` that names it, and the `value`, which shows the
 * formatted value, like "40%", unless you give it children.
 * @stable
 */
const Meter = createParts(meter, {
  name: "Meter",
  tags: {
    root: "div",
    track: "div",
    indicator: "div",
    label: "span",
    value: "span",
  },
  content: { value: (state: { text: string }) => state.text },
})

export type {
  MeterLabelDetails,
  MeterOptions,
  MeterPrimitive,
  MeterState,
  MeterValueState,
  NumberFormat,
} from "@ui-sdk/core/meter"

export { Meter }
