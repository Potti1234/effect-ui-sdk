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
      props: { value: 3, min: 1, max: 5 },
      view: (progress) =>
        progress
          .root(h.div)
          .children(
            progress.label(h.span).children("Account setup, step 3 of 5"),
            progress.value(h.span),
            progress.track(h.div).children(progress.indicator(h.div))
          ),
    }),
})

export { Example }
