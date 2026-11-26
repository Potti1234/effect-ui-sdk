import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Progress, type ProgressOptions } from "@ui-sdk/effect/progress"
import * as Schema from "effect/Schema"
import { progressFixture } from "tests/fixtures/progress.ts"
import { mountFixture } from "../../ssr/effect-mount"

const { upload, loading, files, disk } = progressFixture

const FixtureMessage = UiSchema.TaggedEnum({
  ClickedAdvance: {},
  ClickedRestart: {},
})

const Fixture = Html.component({
  name: "ProgressFixture",
  model: Schema.Struct({ value: Schema.Number }),
  message: FixtureMessage,
}).make({
  init: () => ({ value: upload.value }),
  update: {
    ClickedAdvance: ($) =>
      $.evolve({ value: (value) => Math.min(100, value + upload.step) }),
    ClickedRestart: ($) => $.evolve({ value: upload.value }),
  },
  view: (h, model) => {
    const bar = (label: string, props: ProgressOptions) =>
      Progress(h, {
        key: label,
        props,
        view: (progress) =>
          progress
            .root(h.div.class("gauge"))
            .children(
              progress.label(h.span).children(label),
              progress.value(h.span.class("gauge-value")),
              progress
                .track(h.div.class("gauge-track"))
                .children(progress.indicator(h.div.class("gauge-indicator")))
            ),
      })
    return h.div.class("fixture").children(
      h.button.children("Before"),
      bar(upload.label, { value: model.value }),
      bar(loading.label, { value: null }),
      bar(files.label, {
        value: files.value,
        max: files.max,
        getValueLabel: (value) => files.valueLabel(value!),
      }),
      bar(disk.label, {
        value: disk.value,
        max: disk.max,
        format: disk.format,
      }),
      h.button.on("click", FixtureMessage.ClickedAdvance()).children("Advance"),
      h.button.on("click", FixtureMessage.ClickedRestart()).children("Restart"),
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
