// @vitest-environment happy-dom
import * as UiSchema from "@effect/ui/UiSchema"
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as Html from "@effect/ui/html/Html"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { rating } from "../../../examples/core/rating-stages/keyboard"
import { createParts } from "../src/primitive"

const tick = () => new Promise((resolve) => setTimeout(resolve, 30))

const Rating = createParts(rating, {
  name: "Rating",
  tags: { root: "div", star: "button" },
})

const PageMessage = UiSchema.TaggedEnum({
  RequestedValueChangeRating: { value: Schema.Number, reason: Schema.String },
})

const Page = Html.component({
  name: "Page",
  model: Schema.Struct({ value: Schema.Number, reasons: Schema.String }),
  message: PageMessage,
}).make({
  init: () => ({ value: 3, reasons: "" }),
  update: {
    RequestedValueChangeRating: ($, { value, reason }) =>
      $.evolve({ value, reasons: (reasons) => `${reasons}${reason};` }),
  },
  view: (h, model) =>
    h.div(
      Rating(h, {
        props: { value: model.value },
        onEmit: {
          ValueChange: ({ value, reason }) =>
            PageMessage.RequestedValueChangeRating({
              value,
              reason: reason ?? "",
            }),
        },
        view: (stars) =>
          stars.root(h.div.attr("aria-label", "Rating")).children(
            ["1", "2", "3", "4", "5"].map((value) =>
              stars
                .star(
                  h.button.key(value).attr("aria-label", `${value} stars`),
                  {
                    value,
                  }
                )
                .children("★")
            )
          ),
      }),
      h.output.class("value").children(String(model.value)),
      h.output.class("reasons").children(model.reasons)
    ),
})

function mount() {
  const app = document.body.appendChild(document.createElement("div"))
  Effect.runFork(
    Effect.scoped(
      Effect.gen(function* () {
        yield* BrowserHost.mountEffect(Page, {}, app)
        yield* Effect.never
      })
    ) as Effect.Effect<never>
  )
  return app
}

const star = (app: HTMLElement, value: string) =>
  app.querySelector<HTMLButtonElement>(`[aria-label="${value} stars"]`)!

test("a primitive built from behaviors renders its keyed items", async () => {
  const app = mount()
  await tick()
  expect(app.querySelector('[role="radiogroup"]')).not.toBeNull()
  expect(star(app, "3").getAttribute("aria-checked")).toBe("true")
  expect(star(app, "3").getAttribute("tabindex")).toBe("0")
  expect(star(app, "1").getAttribute("tabindex")).toBe("-1")
  expect(star(app, "4").hasAttribute("data-filled")).toBe(false)
})

test("pressing an item asks the Model, which renders the new value", async () => {
  const app = mount()
  await tick()
  star(app, "5").click()
  await tick()
  expect(app.querySelector(".value")!.textContent).toBe("5")
  expect(app.querySelector(".reasons")!.textContent).toBe("item-press;")
  expect(star(app, "5").getAttribute("aria-checked")).toBe("true")
  expect(star(app, "4").hasAttribute("data-filled")).toBe(true)
})

test("roving focus moves with the arrow keys and reports its reason", async () => {
  const app = mount()
  await tick()
  star(app, "3").focus()
  star(app, "3").dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
  )
  await tick()
  expect(document.activeElement).toBe(star(app, "4"))
  expect(app.querySelector(".value")!.textContent).toBe("4")
  expect(app.querySelector(".reasons")!.textContent).toBe("list-navigation;")
  expect(star(app, "4").getAttribute("tabindex")).toBe("0")
})
