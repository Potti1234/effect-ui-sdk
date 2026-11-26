import * as View from "@effect/ui/View"
import * as Html from "@effect/ui/html/Html"
import { Tabs } from "@ui-sdk/effect/tabs"
import * as Schema from "effect/Schema"

const Icon = <M>(h: Html.H<M>, ...shapes: View.Children<M>) =>
  h
    .el("svg")
    .attrs({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    })
    .children(...shapes)

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    Tabs(h, {
      props: { defaultValue: "inbox" },
      view: (tabs) =>
        tabs.root(h.div).children(
          tabs.list(h.div.attr("aria-label", "Mail")).children(
            tabs.tab(h.button, { value: "inbox" }).children(
              tabs.tabIcon(h.span).children(
                Icon(
                  h,
                  h
                    .el("path")
                    .attr("d", "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"),
                  h.el("rect").attrs({
                    x: "2",
                    y: "4",
                    width: "20",
                    height: "16",
                    rx: "2",
                  })
                )
              ),
              "Inbox"
            ),
            tabs
              .tab(h.button, { value: "replies" })
              .children(
                tabs
                  .tabIcon(h.span, { mirror: true })
                  .children(
                    Icon(
                      h,
                      h.el("path").attr("d", "M20 18v-2a4 4 0 0 0-4-4H4"),
                      h.el("path").attr("d", "m9 17-5-5 5-5")
                    )
                  ),
                "Replies"
              ),
            tabs.tab(h.button, { value: "archive" }).children(
              tabs.tabIcon(h.span).children(
                Icon(
                  h,
                  h.el("rect").attrs({
                    width: "20",
                    height: "5",
                    x: "2",
                    y: "3",
                    rx: "1",
                  }),
                  h
                    .el("path")
                    .attr("d", "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"),
                  h.el("path").attr("d", "M10 12h4")
                )
              ),
              "Archive"
            )
          ),
          tabs.panel(
            h.div.children("3 new messages from Inès Moreau and Kofi Mensah."),
            { value: "inbox" }
          ),
          tabs.panel(
            h.div.children(
              "Wren Takahashi replied to your message about the launch."
            ),
            { value: "replies" }
          ),
          tabs.panel(
            h.div.children("Messages you archived stay here and in search."),
            { value: "archive" }
          )
        ),
    }),
})

export { Example }
