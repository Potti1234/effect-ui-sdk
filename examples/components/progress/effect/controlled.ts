import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Progress } from "@ui-sdk/effect/progress"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const total = 5

const ExampleMessage = UiSchema.TaggedEnum({
  ClickedUploadNext: {},
  ClickedReset: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ uploaded: Schema.Number }),
  message: ExampleMessage,
}).make({
  init: () => ({ uploaded: 1 }),
  update: {
    ClickedUploadNext: ($) => {
      if ($.model.uploaded >= total) {
        return $.model
      }
      const next = $.model.uploaded + 1
      return $.evolve({ uploaded: next }).run(
        log(`Uploaded ${next} of ${total} photos`)
      )
    },
    ClickedReset: ($) =>
      $.evolve({ uploaded: 0 }).run(log("Reset to 0 photos")),
  },
  view: (h, model) =>
    h.div.attr("data-slot", "stack").children(
      h.div.attr("data-slot", "controls").children(
        h.button
          .attrs({
            type: "button",
            "aria-disabled": model.uploaded >= total ? "true" : "false",
          })
          .on("click", ExampleMessage.ClickedUploadNext())
          .children("Upload Next"),
        h.button
          .attr("type", "button")
          .on("click", ExampleMessage.ClickedReset())
          .children("Reset")
      ),
      Progress(h, {
        props: { value: (model.uploaded / total) * 100 },
        view: (progress) =>
          progress
            .root(h.div)
            .children(
              progress.label(h.span).children("Uploading photos"),
              progress.value(h.span),
              progress.track(h.div).children(progress.indicator(h.div))
            ),
      })
    ),
})

export { Example }
