import * as Command from "@effect/ui/Command"
import * as Component from "@effect/ui/Component"
import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { createTabsController, Tabs } from "@ui-sdk/effect/tabs"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const tabs = createTabsController()

const ShowSent = Command.make("ShowSent", { args: {} }, () =>
  Effect.sync(() => {
    tabs.select("sent")
    return Component.noop
  })
)

const ExampleMessage = UiSchema.TaggedEnum({
  RequestedValueChangeMail: {
    value: Schema.NullOr(Schema.String),
    reason: Schema.String,
  },
  ClickedShowSent: {},
})

const Example = Html.component({
  name: "Example",
  model: Schema.Struct({ value: Schema.NullOr(Schema.String) }),
  message: ExampleMessage,
}).make({
  init: () => ({ value: "inbox" }),
  update: {
    RequestedValueChangeMail: ($, { value, reason }) =>
      $.evolve({ value }).run(log(`value: ${value} (${reason})`)),
    ClickedShowSent: ($) => $.run(ShowSent.make({})),
  },
  view: (h, model) =>
    h.div.children(
      h.div
        .attr("data-slot", "controls")
        .children(
          h.button
            .attr("type", "button")
            .on("click", ExampleMessage.ClickedShowSent())
            .children("Show Sent Mail")
        ),
      Tabs(h, {
        props: { value: model.value, controller: tabs },
        onEmit: {
          ValueChange: ({ value, reason }) =>
            ExampleMessage.RequestedValueChangeMail({
              value,
              reason: reason ?? "imperative",
            }),
        },
        view: (mail) =>
          mail
            .root(h.div)
            .children(
              mail
                .list(h.div.attr("aria-label", "Mail"))
                .children(
                  mail.tab(h.button, { value: "inbox" }).children("Inbox"),
                  mail.tab(h.button, { value: "drafts" }).children("Drafts"),
                  mail.tab(h.button, { value: "sent" }).children("Sent"),
                  mail.indicator(h.span)
                ),
              mail.panel(
                h.div.children(
                  "3 unread messages from Hollis Grant and Inès Moreau."
                ),
                { value: "inbox" }
              ),
              mail.panel(
                h.div.children(
                  "2 drafts, the last one edited yesterday at 4:12 PM."
                ),
                { value: "drafts" }
              ),
              mail.panel(
                h.div.children("12 messages sent this week, all delivered."),
                { value: "sent" }
              )
            ),
      })
    ),
})

export { Example }
