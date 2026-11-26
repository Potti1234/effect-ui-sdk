import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Progress } from "@ui-sdk/effect/progress"
import * as Schema from "effect/Schema"
import { mountFixture } from "../../ssr/effect-mount"

// Parts rendered as other elements, and with functions of their state. The
// OTP Input waits for OTPInput in @ui-sdk/effect.
const FixtureMessage = UiSchema.TaggedEnum({ ClickedFinish: {} })

const Fixture = Html.component({
  name: "ProgressRenderFixture",
  model: Schema.Struct({ value: Schema.Number }),
  message: FixtureMessage,
}).make({
  init: () => ({ value: 40 }),
  update: {
    ClickedFinish: ($) => $.evolve({ value: 100 }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Progress(h, {
        props: { value: model.value },
        view: (progress) =>
          progress
            .root(
              h.section
                .attr("aria-label", "Export")
                .class("gauge", `is-${progress.state.status}`)
            )
            .children(
              progress
                .value(h.span)
                .children(`${progress.value.state().percent}% done`),
              progress
                .track(h.div.class("gauge-track"))
                .children(progress.indicator(h.div.class("gauge-indicator")))
            ),
      }),
      h.button.on("click", FixtureMessage.ClickedFinish()).children("Finish"),
      h.button.children("After"),
      h.output.attrs({ role: "status", "aria-label": "Last action" })
    ),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, {})
}

export { mount }
