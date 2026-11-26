import { label } from "@ui-sdk/core/label"
import { createParts } from "./create-parts"

/**
 * A native <label> that names any control, by `for` or by wrapping it. A
 * control a <label> can't reach, like a radio group or a slider, takes it as
 * its name, and a press on the label activates it. Its `view` gets the
 * `root` part.
 * @experimental
 */
const Label = createParts(label, {
  name: "Label",
  tags: { root: "label" },
})

export { Label }
export type { LabelOptions, LabelPrimitive } from "@ui-sdk/core/label"
