import * as Html from "@effect/ui/html/Html"
import { Checkbox } from "@ui-sdk/effect/checkbox"
import { Label } from "@ui-sdk/effect/label"
import { RadioGroup } from "@ui-sdk/effect/radio"
import * as Schema from "effect/Schema"
import { labelFixture } from "tests/fixtures/label.ts"
import { mountFixture } from "../../ssr/effect-mount"

const { email, plan, volume, terms, region, delivery, quantity } = labelFixture

// The volume slider and the quantity number input wait for Slider and
// NumberInput in @ui-sdk/effect.
const Fixture = Html.component({
  name: "LabelFixture",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) => {
    const labelFor = (id: string, text: string) =>
      Label(h, {
        key: `label-${id}`,
        view: (label) => label.root(h.label.attr("for", id)).children(text),
      })
    const group = (
      { id, items }: typeof plan | typeof region,
      props: { defaultValue?: string; disabled?: boolean },
      name?: string
    ) =>
      RadioGroup(h, {
        key: `group-${id}`,
        props,
        view: (radios) =>
          radios
            .group(
              h.div
                .attrs({ id, ...(name ? { "aria-label": name } : {}) })
                .class("radio-group")
            )
            .children(
              items.flatMap((item) => [
                radios
                  .radio(h.button.key(item.value).class("radio"), {
                    value: item.value,
                  })
                  .children(item.label),
                radios.input(h.input.key(`${item.value}-input`), {
                  value: item.value,
                }),
              ])
            ),
      })
    return h.div.class("fixture").children(
      h.button.children("Before"),
      labelFor(email.id, email.label),
      h.input.attr("id", email.id),
      labelFor(plan.id, plan.label),
      group(plan, { defaultValue: plan.defaultValue }),
      labelFor(volume.id, volume.label),
      Checkbox(h, {
        key: "terms",
        view: (checkbox) =>
          Label(h, {
            key: "label-terms",
            view: (label) =>
              label
                .root(h.label)
                .children(
                  checkbox.root(h.button.class("checkbox")),
                  checkbox.input(h.input),
                  terms.label
                ),
          }),
      }),
      labelFor(region.id, region.label),
      group(region, { disabled: true }),
      labelFor(delivery.id, delivery.label),
      group(delivery, {}, delivery.name),
      labelFor(quantity.id, quantity.label),
      h.button.children("After")
    )
  },
})

const props = () => ({})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
