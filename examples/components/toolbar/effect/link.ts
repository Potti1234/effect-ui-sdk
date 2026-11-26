import * as UiSchema from "@effect/ui/UiSchema"
import * as Html from "@effect/ui/html/Html"
import { Toolbar } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"
import { log } from "../../../shared/effect/log"

const svg = <M>(h: Html.H<M>) =>
  h.el("svg").attrs({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  })

const pages = [
  { href: "#files", label: "Files Changed" },
  { href: "#checks", label: "Checks" },
]

const ExampleMessage = UiSchema.TaggedEnum({
  PressedButton: { message: Schema.String },
  OpenedPage: { label: Schema.String },
})

type Press = {
  button: number
  meta: boolean
  ctrl: boolean
  shift: boolean
  alt: boolean
}

const plain = (press: Press) =>
  press.button === 0 && !press.meta && !press.ctrl && !press.shift && !press.alt

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: ExampleMessage,
}).make({
  init: () => null,
  update: {
    PressedButton: ($, { message }) => $.set(null).run(log(message)),
    OpenedPage: ($, { label }) => $.set(null).run(log(`Opened ${label}`)),
  },
  view: (h) =>
    Toolbar(h, {
      view: (toolbar) =>
        toolbar.root(h.div.attr("aria-label", "Pull request")).children(
          toolbar
            .button(
              h.button
                .attr("aria-label", "Approve")
                .on(
                  "click",
                  ExampleMessage.PressedButton({ message: "Approved" })
                )
            )
            .children(
              svg(h).children(h.el("path").attr("d", "M20 6 9 17l-5-5"))
            ),
          toolbar
            .button(
              h.button
                .attr("aria-label", "Comment")
                .on(
                  "click",
                  ExampleMessage.PressedButton({ message: "Comment" })
                )
            )
            .children(
              svg(h).children(
                h
                  .el("path")
                  .attr(
                    "d",
                    "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
                  )
              )
            ),
          toolbar.separator(h.div),
          pages.map((page) =>
            toolbar
              .link(
                h.a
                  .key(page.href)
                  .attr("href", page.href)
                  .on(
                    "click",
                    (press) =>
                      plain(press)
                        ? ExampleMessage.OpenedPage({ label: page.label })
                        : undefined,
                    { preventDefault: true }
                  )
              )
              .children(page.label)
          )
        ),
    }),
})

export { Example }
