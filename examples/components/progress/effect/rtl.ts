import * as Html from "@effect/ui/html/Html"
import { Progress } from "@ui-sdk/effect/progress"
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
      Progress(h, {
        props: { value: 56, locale: "ar-EG" },
        view: (progress) =>
          progress
            .root(h.div)
            .children(
              progress.label(h.span).children("تقدم الرفع"),
              progress.value(h.span),
              progress.track(h.div).children(progress.indicator(h.div))
            ),
      })
    ),
})

export { Example }
