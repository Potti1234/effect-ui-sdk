import * as Html from "@effect/ui/html/Html"
import { Progress } from "@ui-sdk/effect/progress"
import * as Schema from "effect/Schema"

const bars = [
  {
    label: "Download",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Video render",
    value: 87.25,
    format: { style: "percent", maximumFractionDigits: 1 },
  },
  {
    label: "Backup",
    value: 45,
    max: 60,
    format: (minutes: number) => `${60 - minutes} min left`,
  },
  { label: "Synchronisierung", value: 40, locale: "de-DE" },
] satisfies {
  label: string
  value: number
  max?: number
  format?: Intl.NumberFormatOptions | ((value: number) => string)
  locale?: string
}[]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("data-slot", "stack").children(
      bars.map(({ label, ...options }) =>
        Progress(h, {
          key: label,
          props: options,
          view: (progress) =>
            progress
              .root(h.div)
              .children(
                progress.label(h.span).children(label),
                progress.value(h.span),
                progress.track(h.div).children(progress.indicator(h.div))
              ),
        })
      )
    ),
})

export { Example }
