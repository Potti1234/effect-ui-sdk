import { accordion } from "@ui-sdk/core/accordion"
import { createParts } from "./create-parts"

/**
 * A stack of items that each open a section of content. One item is open at
 * a time unless `multiple` is set. Its `view` gets the `root`, `item`,
 * `header`, `trigger` and `panel` parts; `accordion.in("item", { value })`
 * gives the header, trigger and panel of one item.
 * @stable
 */
const Accordion = createParts(accordion, {
  name: "Accordion",
  tags: {
    root: "div",
    item: "div",
    header: "h3",
    trigger: "button",
    panel: "div",
  },
  present: ["panel"],
})

export { createAccordionController } from "@ui-sdk/core/accordion"
export type {
  AccordionApi,
  AccordionChangeOptions,
  AccordionController,
  AccordionHeaderProps,
  AccordionHeaderState,
  AccordionItemProps,
  AccordionItemState,
  AccordionOptions,
  AccordionPanelProps,
  AccordionPanelState,
  AccordionPrimitive,
  AccordionState,
  AccordionTriggerProps,
  AccordionTriggerState,
  AccordionValueChangeReason,
} from "@ui-sdk/core/accordion"

export { Accordion }
