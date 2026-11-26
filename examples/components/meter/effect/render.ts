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
      props: { value: 91 },
      view: (meter) =>
        meter
          .root(h.div)
          .children(
            meter.label(h.span).children("Disk"),
            meter.value(h.span).children(`${meter.value.state().text} used`),
            meter
              .track(h.span)
              .children(
                meter.indicator(
                  meter.indicator.state().percent >= 90
                    ? h.div.attr("data-variant", "destructive")
                    : h.div
                )
              )
          ),
    }),
})

export { Example }
