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
    h.div.attr("dir", "rtl").children(
      Meter(h, {
        props: { value: 68, locale: "ar-EG" },
        view: (meter) =>
          meter
            .root(h.div)
            .children(
              meter.label(h.span).children("مساحة التخزين"),
              meter.value(h.span),
              meter.track(h.div).children(meter.indicator(h.div))
            ),
      })
    ),
})

export { Example }
