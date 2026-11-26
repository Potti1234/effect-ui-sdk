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
      props: { value: 720, min: 300, max: 850, format: { style: "decimal" } },
      view: (meter) =>
        meter
          .root(h.div)
          .children(
            meter.label(h.span).children("Credit score"),
            meter.value(h.span),
            meter.track(h.div).children(meter.indicator(h.div))
          ),
    }),
})

export { Example }
