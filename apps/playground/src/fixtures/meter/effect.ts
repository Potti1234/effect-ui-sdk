import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Meter, type MeterOptions } from "@ui-sdk/effect/meter"
import * as Schema from "effect/Schema"
import { meterFixture } from "tests/fixtures/meter.ts"
import { mountFixture } from "../../ssr/effect-mount"

const { storage, requests, disk, score } = meterFixture

const FixtureMessage = UiSchema.TaggedEnum({
  ClickedFill: {},
  ClickedReset: {},
})

const Fixture = Html.component({
  name: "MeterFixture",
  model: Schema.Struct({ value: Schema.Number }),
  message: FixtureMessage,
}).make({
  init: () => ({ value: storage.value }),
  update: {
    ClickedFill: ($) => $.evolve({ value: (value) => value + storage.step }),
    ClickedReset: ($) => $.evolve({ value: storage.value }),
  },
  view: (h, model) => {
    const gauge = (label: string, props: MeterOptions) =>
      Meter(h, {
        key: label,
        props,
        view: (meter) =>
          meter
            .root(h.div.class("gauge"))
            .children(
              meter.label(h.span).children(label),
              meter.value(h.span.class("gauge-value")),
              meter
                .track(h.div.class("gauge-track"))
                .children(meter.indicator(h.div.class("gauge-indicator")))
            ),
      })
    return h.div.class("fixture").children(
      h.button.children("Before"),
      gauge(storage.label, { value: model.value }),
      gauge(requests.label, {
        value: requests.value,
        max: requests.max,
        getValueLabel: requests.valueLabel,
      }),
      gauge(disk.label, {
        value: disk.value,
        max: disk.max,
        format: disk.format,
      }),
      gauge(score.label, {
        value: score.value,
        min: score.min,
        max: score.max,
      }),
      h.button.on("click", FixtureMessage.ClickedFill()).children("Fill"),
      h.button.on("click", FixtureMessage.ClickedReset()).children("Reset"),
      h.button.children("After"),
      h.output.attrs({ role: "status", "aria-label": "Last action" })
    )
  },
})

const props = () => ({})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
