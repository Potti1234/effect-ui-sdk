import { separator } from "@ui-sdk/core/separator"
import { createParts } from "./create-parts"

/**
 * A line between groups of content, announced as a separator unless it's
 * `decorative`. Its `view` gets the `root` part.
 * @stable
 */
const Separator = createParts(separator, {
  name: "Separator",
  tags: { root: "div" },
})

export type {
  SeparatorOptions,
  SeparatorOrientation,
  SeparatorPrimitive,
  SeparatorState,
} from "@ui-sdk/core/separator"

export { Separator }
