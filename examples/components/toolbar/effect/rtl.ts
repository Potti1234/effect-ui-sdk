import * as Html from "@effect/ui/html/Html"
import { Toggle } from "@ui-sdk/effect/toggle"
import { Toolbar, toolbarScope } from "@ui-sdk/effect/toolbar"
import * as Schema from "effect/Schema"

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

const line = <M>(
  h: Html.H<M>,
  x1: string,
  x2: string,
  y1: string,
  y2: string
) => h.el("line").attrs({ x1, x2, y1, y2 })

const styles = [
  {
    label: "غامق",
    icon: <M>(h: Html.H<M>) =>
      svg(h).children(
        h
          .el("path")
          .attr(
            "d",
            "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"
          )
      ),
  },
  {
    label: "مائل",
    icon: <M>(h: Html.H<M>) =>
      svg(h).children(
        line(h, "19", "10", "4", "4"),
        line(h, "14", "5", "20", "20"),
        line(h, "15", "9", "4", "20")
      ),
  },
]

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("dir", "rtl").children(
      Toolbar(h, {
        view: (toolbar) =>
          toolbar.root(h.div.attr("aria-label", "تنسيق")).children(
            styles.map((style) =>
              Toggle(h, {
                key: style.label,
                props: { toolbar: toolbarScope(toolbar.join) },
                view: (toggle) =>
                  toggle
                    .root(h.button.attr("aria-label", style.label))
                    .children(toggle.icon(h.span.children(style.icon(h)))),
              })
            ),
            toolbar.separator(h.div),
            toolbar
              .button(h.button.attr("aria-label", "إدراج رابط"))
              .children(
                svg(h).children(
                  h
                    .el("path")
                    .attr(
                      "d",
                      "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    ),
                  h
                    .el("path")
                    .attr(
                      "d",
                      "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    )
                )
              )
          ),
      })
    ),
})

export { Example }
