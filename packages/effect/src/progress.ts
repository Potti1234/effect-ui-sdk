import { progress } from "@ui-sdk/core/progress"
import { createParts } from "./create-parts"

/**
 * A progress bar. Its `view` gets the `root`, which is the progressbar, the
 * `track` the `indicator` fills, the `label` that names it, and the `value`,
 * which shows the formatted value, like "40%", unless you give it children.
 * @stable
 */
const Progress = createParts(progress, {
  name: "Progress",
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
  GaugeLabelDetails,
  NumberFormat,
  ProgressOptions,
  ProgressPrimitive,
  ProgressState,
  ProgressStatus,
  ProgressValueState,
} from "@ui-sdk/core/progress"

export { Progress }
