import * as Html from "@effect/ui/html/Html"
import { Meter } from "@ui-sdk/effect/meter"
import * as Schema from "effect/Schema"

const meters = [
  {
    label: "Storage",
    value: 120,
    max: 250,
    format: { style: "unit", unit: "gigabyte" },
  },
  {
    label: "Budget",
    value: 1840,
    max: 2500,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  {
    label: "Seats",
    value: 18,
    max: 25,
    format: (seats: number) => `${seats} of 25 seats`,
  },
  { label: "Auslastung", value: 40, locale: "de-DE" },
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
      meters.map(({ label, ...options }) =>
        Meter(h, {
          key: label,
          props: options,
          view: (meter) =>
            meter
              .root(h.div)
              .children(
                meter.label(h.span).children(label),
                meter.value(h.span),
                meter.track(h.div).children(meter.indicator(h.div))
              ),
        })
      )
    ),
})

export { Example }
