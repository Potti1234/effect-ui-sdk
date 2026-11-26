// @vitest-environment jsdom
import { afterEach, expect, test } from "vitest"
import { segmentedControl } from "../src/components/segmented-control/segmented-control"
import { bind } from "../src/foundation/kernel/part"

const cleanups: (() => void)[] = []
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  document.body.replaceChildren()
})

const tick = () => new Promise((resolve) => setTimeout(resolve))

test("the indicator measures once its checked item binds after it", async () => {
  const instance = segmentedControl({ id: "s", defaultValue: "grid" })
  const root = document.body.appendChild(document.createElement("div"))
  cleanups.push(bind(instance.part("root", {}), root)!)
  const indicator = root.appendChild(document.createElement("span"))
  cleanups.push(bind(instance.part("indicator", {}), indicator)!)
  const items = ["list", "grid"].map((value) => {
    const el = root.appendChild(document.createElement("button"))
    el.setAttribute("role", "radio")
    return { value, el }
  })
  await tick()
  expect(indicator.hasAttribute("data-visible")).toBe(false)
  for (const { value, el } of items) {
    cleanups.push(bind(instance.part("item", { value }), el)!)
    await tick()
  }
  expect(indicator.hasAttribute("data-visible")).toBe(true)
})
