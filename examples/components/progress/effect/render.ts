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
    Progress(h, {
      props: { value: 18 },
      view: (progress) => {
        const value = progress.value.state()
        const indicator = progress.indicator.state()
        return progress
          .root(h.div)
          .children(
            progress.label(h.span).children("Battery"),
            progress
              .value(h.span)
              .children(
                value.status === "complete"
                  ? "Charged"
                  : `${value.text} charged`
              ),
            progress
              .track(h.span)
              .children(
                progress.indicator(
                  (indicator.percent ?? 0) < 20
                    ? h.div.attr("data-variant", "destructive")
                    : h.div
                )
              )
          )
      },
    }),
})

export { Example }
