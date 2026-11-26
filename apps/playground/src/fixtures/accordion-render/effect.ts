import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Accordion } from "@ui-sdk/effect/accordion"
import * as Schema from "effect/Schema"
import { describeValue } from "tests/fixtures/accordion.ts"
import { mountFixture } from "../../ssr/effect-mount"

const FixtureMessage = UiSchema.TaggedEnum({
  ChangedSections: { value: Schema.Array(Schema.String) },
})

const Fixture = Html.component({
  name: "AccordionRenderFixture",
  model: Schema.Struct({ action: Schema.String }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "" }),
  update: {
    ChangedSections: ($, { value }) =>
      $.evolve({ action: describeValue(value) }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Accordion(h, {
        props: { defaultValue: ["overview"] },
        onEmit: (event) =>
          event._tag === "ValueChange"
            ? FixtureMessage.ChangedSections({
                value: event.value as string[],
              })
            : undefined,
        view: (accordion) => {
          const overview = accordion.in("item", { value: "overview" })
          const details = accordion.in("item", { value: "details" })
          const overviewTrigger = overview.trigger.state()
          return accordion
            .root(h.div.class("accordion"))
            .children(
              accordion
                .item(
                  h.div.class(
                    "accordion-item",
                    accordion.item.state({ value: "overview" }).open
                      ? "is-open"
                      : "is-closed"
                  ),
                  { value: "overview" }
                )
                .children(
                  overview
                    .header(h.h2.class("accordion-header"))
                    .children(
                      overview
                        .trigger(h.button.class("accordion-trigger"))
                        .children(
                          "Overview",
                          h.span
                            .attr("aria-hidden", "true")
                            .children(` ${overviewTrigger.open ? "−" : "+"}`),
                          h.span
                            .class("index")
                            .attr("hidden", "")
                            .children(String(overviewTrigger.index))
                        )
                    ),
                  overview.panel(
                    h.section
                      .class("accordion-panel")
                      .children("The overview panel.")
                  )
                ),
              accordion
                .item(h.div.class("accordion-item"), { value: "details" })
                .children(
                  details
                    .header(h.h3.class("accordion-header"))
                    .children(
                      details
                        .trigger(h.div.class("accordion-trigger"))
                        .children("Details")
                    ),
                  details.panel(
                    h.div
                      .class("accordion-panel")
                      .children("The details panel.")
                  )
                )
            )
        },
      }),
      h.button.children("After"),
      h.output
        .attr("role", "status")
        .attr("aria-label", "Last action")
        .children(model.action)
    ),
})

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, {})
}

export { mount }
