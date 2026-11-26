// What an `effect` fixture does: mounts its root component, and an
// `effect-ssr` fixture: fetches its server HTML and state from `/__ssr`, shows
// them, records what the specs read, then hydrates. Both resolve once the
// first render is on the page and its mounts have run.
import * as BrowserHost from "@effect/ui/html/BrowserHost"
import * as HtmlHydrate from "@effect/ui/html/HtmlHydrate"
import * as Effect from "effect/Effect"

type Root = Parameters<typeof BrowserHost.mountEffect>[0]

const frame = () =>
  new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))

function run(start: Effect.Effect<unknown, never, never>) {
  return new Promise<void>((resolve, reject) => {
    Effect.runFork(
      Effect.scoped(
        Effect.gen(function* () {
          yield* start
          yield* Effect.promise(frame)
          resolve()
          yield* Effect.never
        })
      ).pipe(Effect.tapCause((cause) => Effect.sync(() => reject(cause))))
    )
  })
}

function mountFixture(root: HTMLElement, fixture: unknown, props: unknown) {
  return run(
    BrowserHost.mountEffect(fixture as Root, props as never, root) as never
  )
}

async function hydrateFixture(
  root: HTMLElement,
  fixture: unknown,
  props: unknown,
  { manual = false } = {}
) {
  const errors: string[] = []
  const page = window as unknown as Record<string, unknown>
  page.__hydrationErrors = errors
  const name = new URLSearchParams(location.search).get("fixture") ?? ""
  const request = new URLSearchParams({
    fixture: name,
    framework: "effect",
    url: location.href,
  })
  const response = await fetch(`/__ssr?${request}`)
  const text = await response.text()
  if (!response.ok) {
    root.textContent = text
    throw new Error(`Server rendering ${name} failed:\n${text}`)
  }
  const { html, state } = JSON.parse(text) as { html: string; state: never }
  root.innerHTML = html
  page.__serverHtml = root.innerHTML
  page.__visibleBeforeHydration = !!root
    .querySelector<HTMLElement>('[data-slot$="-content"]')
    ?.checkVisibility()
  const error = console.error
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "))
    error(...args)
  }
  const hydrate = () =>
    run(
      HtmlHydrate.hydrateEffect(
        fixture as Root,
        props as never,
        root,
        state
      ) as never
    )
  // With ?hydrate=manual, the page stays server markup until window.hydrate() runs.
  if (
    manual &&
    new URLSearchParams(location.search).get("hydrate") === "manual"
  ) {
    page.hydrate = hydrate
    return
  }
  return hydrate()
}

export { hydrateFixture, mountFixture }
