import * as Html from "@effect/ui/html/Html"
import { Meter } from "@ui-sdk/effect/meter"
import * as Schema from "effect/Schema"

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Meter(h, {
      props: {
        value: 750,
        max: 1000,
        getValueLabel: (value, details) =>
          `${value} of ${details.max} requests, ${details.formatted}`,
      },
      view: (meter) =>
        meter
          .root(h.div)
          .children(
            meter.label(h.span).children("API requests"),
            meter.value(h.span).children("750 / 1,000"),
            meter.track(h.div).children(meter.indicator(h.div))
          ),
    }),
})

export { Example }
