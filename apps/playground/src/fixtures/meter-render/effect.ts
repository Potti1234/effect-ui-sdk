import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Meter } from "@ui-sdk/effect/meter"
import * as Schema from "effect/Schema"
import { mountFixture } from "../../ssr/effect-mount"

// Parts rendered as other elements, and with functions of their state.
const FixtureMessage = UiSchema.TaggedEnum({ ClickedFill: {} })

const Fixture = Html.component({
  name: "MeterRenderFixture",
  model: Schema.Struct({ value: Schema.Number }),
  message: FixtureMessage,
}).make({
  init: () => ({ value: 40 }),
  update: {
    ClickedFill: ($) => $.evolve({ value: 90 }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Meter(h, {
        props: { value: model.value },
        view: (meter) =>
          meter
            .root(
              h.section
                .attr("aria-label", "Memory")
                .class("gauge", meter.state.percent >= 80 ? "is-high" : "is-ok")
            )
            .children(
              meter.value(h.span).children(`${meter.value.state().text} used`),
              meter
                .track(h.div.class("gauge-track"))
                .children(meter.indicator(h.div.class("gauge-indicator")))
            ),
      }),
      h.button.on("click", FixtureMessage.ClickedFill()).children("Fill"),
      h.button.children("After"),
      h.output.attrs({ role: "status", "aria-label": "Last action" })
    ),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, {})
}

export { mount }
