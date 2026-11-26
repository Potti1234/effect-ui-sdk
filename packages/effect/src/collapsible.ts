import { collapsible } from "@ui-sdk/core/collapsible"
import { createParts } from "./create-parts"

/**
 * A panel of content that a button shows and hides. Its `view` gets the
 * `root`, `trigger` and `panel` parts. Pass `open` to keep the open state in
 * your Model, and handle `OpenChange` to decide each change.
 * @stable
 */
const Collapsible = createParts(collapsible, {
  name: "Collapsible",
  tags: {
    root: "div",
    trigger: "button",
    panel: "div",
  },
  present: ["panel"],
})

export { createCollapsibleController } from "@ui-sdk/core/collapsible"
export type {
  CollapsibleApi,
  CollapsibleChangeOptions,
  CollapsibleController,
  CollapsibleOpenChangeReason,
  CollapsibleOptions,
  CollapsiblePanelProps,
  CollapsiblePanelState,
  CollapsiblePrimitive,
  CollapsibleState,
  CollapsibleTriggerProps,
  CollapsibleTriggerState,
} from "@ui-sdk/core/collapsible"

export { Collapsible }
