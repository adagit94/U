import CursorPager from "data/dataManagment/pagers/CursorPager";
import { expect, test } from "vitest";

test("stepping", () => {
  const pager = new CursorPager({ take: 10 });

  expect(pager.getState().take).toBe(10);

  let step = pager.advance();

  expect(step.take).toBe(10);
});