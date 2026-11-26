import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"
import { tabsOptions } from "tests/fixtures/page.ts"
import { mountFixture } from "../../ssr/effect-mount"

const FixtureProps = Schema.Struct({
  activation: Schema.optional(Schema.Literals(["automatic", "manual"])),
})

const FixtureMessage = UiSchema.TaggedEnum({
  ChangedTab: {
    value: Schema.NullOr(Schema.String),
    reason: Schema.String,
  },
})

const Fixture = Html.component({
  name: "TabsRenderFixture",
  props: FixtureProps,
  model: Schema.Struct({ action: Schema.String, reason: Schema.String }),
  message: FixtureMessage,
}).make({
  init: () => ({ action: "", reason: "" }),
  update: {
    ChangedTab: ($, { value, reason }) =>
      $.evolve({ action: value ?? "", reason }),
  },
  view: (h, model) =>
    h.div.class("fixture").children(
      h.button.children("Before"),
      Tabs(h, {
        props: { defaultValue: "overview", activation: h.props.activation },
        onEmit: {
          ValueChange: ({ value, reason }) =>
            FixtureMessage.ChangedTab({ value, reason: reason ?? "" }),
        },
        view: (tabs) =>
          tabs.root(h.div.class("tabs")).children(
            tabs
              .list(h.div.class("tablist").attr("aria-label", "Project"))
              .children(
                tabs
                  .tab(h.a.class("tab").attr("href", "#overview"), {
                    value: "overview",
                  })
                  .children("Overview"),
                tabs
                  .tab(h.a.class("tab").attr("href", "#activity"), {
                    value: "activity",
                  })
                  .children("Activity"),
                tabs
                  .tab(h.button.class("tab"), { value: "watched" })
                  .children(
                    "Watched",
                    tabs.tab.state({ value: "watched" }).selected &&
                      h.span.attr("aria-hidden", "true").children(" •")
                  ),
                tabs
                  .tab(
                    h.button.class(
                      "tab",
                      tabs.tab.state({ value: "plain" }).selected
                        ? "is-selected"
                        : "is-unselected"
                    ),
                    { value: "plain" }
                  )
                  .children("Plain")
              ),
            ["overview", "activity", "watched", "plain"].map((value) =>
              tabs.panel(
                h.div.key(value).class("panel").children(`The ${value} panel.`),
                { value }
              )
            )
          ),
      }),
      h.button.key("after").children("After"),
      h.output
        .key("action")
        .attrs({ role: "status", "aria-label": "Last action" })
        .children(model.action),
      h.output
        .key("reason")
        .attrs({ role: "status", "aria-label": "Reason" })
        .children(model.reason)
    ),
})

const props = () => {
  const { activation } = tabsOptions()
  return activation ? { activation } : {}
}

function mount(root: HTMLElement) {
  return mountFixture(root, Fixture, props())
}

export { Fixture, mount, props }
