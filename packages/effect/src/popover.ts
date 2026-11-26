import { popover } from "@ui-sdk/core/popover"
import { createParts } from "./create-parts"

/**
 * Rich content in a floating panel, opened from a button. Its `view` gets
 * the `trigger`, the `content` positioned against it, which is in the top
 * layer while open, and the `title`, `description`, `close`, `arrow` and
 * `shortcut` parts inside it.
 * @stable
 */
const Popover = createParts(popover, {
  name: "Popover",
  tags: {
    trigger: "button",
    content: "div",
    viewport: "div",
    title: "h2",
    description: "p",
    close: "button",
    arrow: "div",
    shortcut: "kbd",
  },
  present: ["content", "viewport"],
  content: { shortcut: (state: { text: string }) => state.text },
})

export { createPopoverController } from "@ui-sdk/core/popover"
export type {
  PopoverApi,
  PopoverArrowState,
  PopoverContentProps,
  PopoverContentState,
  PopoverController,
  PopoverDismissReason,
  PopoverFinalFocus,
  PopoverInitialFocus,
  PopoverOpenChangeReason,
  PopoverOptions,
  PopoverPayloadChangeReason,
  PopoverPrimitive,
  PopoverShortcutProps,
  PopoverShortcutState,
  PopoverTriggerProps,
  PopoverTriggerState,
} from "@ui-sdk/core/popover"

export { Popover }
