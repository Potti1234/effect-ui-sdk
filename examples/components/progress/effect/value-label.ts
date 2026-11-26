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
      props: {
        value: 3,
        max: 12,
        getValueLabel: (value, details) =>
          `${value} of ${details.max} files, ${details.formatted}`,
      },
      view: (progress) =>
        progress
          .root(h.div)
          .children(
            progress.label(h.span).children("Copying files"),
            progress.value(h.span).children("3 of 12"),
            progress.track(h.div).children(progress.indicator(h.div))
          ),
    }),
})

export { Example }
