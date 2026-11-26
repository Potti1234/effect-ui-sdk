import * as Html from "@effect/ui/html/Html"
import { Collapsible } from "@ui-sdk/effect/collapsible"
import * as Schema from "effect/Schema"

const details = [
  { label: "عنوان الشحن", value: "شارع الملك فهد، الرياض" },
  { label: "المنتجات", value: "قميص كتان × ٢" },
  { label: "التوصيل", value: "عادي، يصل في ٧ مارس" },
  { label: "الإجمالي", value: "٨٤٫٠٠ $" },
]

const Chevron = <M>(h: Html.H<M>) =>
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
    .children(h.el("path").attr("d", "m6 9 6 6 6-6"))

const Example = Html.component({
  name: "Example",
  model: Schema.Null,
  message: Schema.Never,
}).make({
  init: () => null,
  update: ($) => $.model,
  view: (h) =>
    h.div.attr("dir", "rtl").children(
      Collapsible(h, {
        view: (collapsible) =>
          collapsible
            .root(h.div)
            .children(
              h.div
                .attr("data-slot", "row")
                .children(
                  h.div
                    .attr("data-slot", "stack")
                    .children(
                      h.p.children("الطلب #4189"),
                      h.p
                        .attr("data-slot", "hint")
                        .children("تم الطلب في ٣ مارس")
                    ),
                  h.span.attr("data-slot", "row").children("تم الشحن")
                ),
              h.div.children(
                collapsible
                  .trigger(h.button.attr("data-variant", "ghost"))
                  .children("تفاصيل الطلب", Chevron(h)),
                collapsible.panel(
                  h.dl.children(
                    details.map((detail) =>
                      h.div
                        .attr("data-slot", "row")
                        .children(
                          h.dt.children(detail.label),
                          h.dd.children(detail.value)
                        )
                    )
                  )
                )
              )
            ),
      })
    ),
})

export { Example }
