import { segmentedControl } from "@ui-sdk/core/segmented-control"
import { createParts } from "./create-parts"

/**
 * A row of options where exactly one is on, like a radio group drawn as
 * buttons, with an indicator that slides to the checked item. Its `view`
 * gets the `root`, an `item` and its hidden native `input` per option, which
 * goes beside it, and the `indicator`, whose box comes from the
 * `--segmented-control-indicator-*` variables.
 * @experimental
 */
const SegmentedControl = createParts(segmentedControl, {
  name: "SegmentedControl",
  tags: { root: "div", item: "button", input: "input", indicator: "span" },
})

export { createSegmentedControlController } from "@ui-sdk/core/segmented-control"
export type {
  SegmentedControlApi,
  SegmentedControlChangeOptions,
  SegmentedControlController,
  SegmentedControlDirection,
  SegmentedControlIndicatorProps,
  SegmentedControlIndicatorState,
  SegmentedControlItemProps,
  SegmentedControlItemState,
  SegmentedControlOptions,
  SegmentedControlOrientation,
  SegmentedControlPrimitive,
  SegmentedControlState,
  SegmentedControlValueChangeReason,
} from "@ui-sdk/core/segmented-control"

export { SegmentedControl }
