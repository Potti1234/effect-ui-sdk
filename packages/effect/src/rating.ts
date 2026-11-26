import { rating } from "@ui-sdk/core/rating"
import { createParts } from "./create-parts"

/**
 * A score picked from a row of stars, a radio per star or half star, with a
 * preview while a pointer moves over them. Its `view` gets the `root`, an
 * `item` per star, given its `index` from 1, and inside it a `radio` and its
 * hidden native `input` per score the star picks, from
 * `ratingItemValues(index, step)`.
 * @experimental
 */
const Rating = createParts(rating, {
  name: "Rating",
  tags: { root: "div", item: "span", radio: "button", input: "input" },
})

export { createRatingController, ratingItemValues } from "@ui-sdk/core/rating"
export type {
  RatingApi,
  RatingChangeOptions,
  RatingController,
  RatingItemProps,
  RatingItemState,
  RatingOptions,
  RatingPrimitive,
  RatingState,
  RatingValueChangeReason,
} from "@ui-sdk/core/rating"

export { Rating }
