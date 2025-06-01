import OffsetPager from "data/dataManagment/pagers/OffsetPager";
import { expect, test } from "vitest";

test("stepping", () => {
  const pager = new OffsetPager({ take: 10 });

  expect(pager.getState().step).toBe(0);
  expect(pager.getState().take).toBe(10);

  let step = pager.advance();

  expect(step.skip).toBe(0);
  expect(step.take).toBe(10);

  step.close(true);
  step = pager.advance();

  expect(step.skip).toBe(10);
  expect(step.take).toBe(10);

  step.close(true);
  step = pager.advance({ steps: 2 });

  expect(step.skip).toBe(20);
  expect(step.take).toBe(20);

  step.close(true);

  expect(pager.getState().step).toBe(4);

  step = pager.advance();

  expect(step.skip).toBe(40);
  expect(step.take).toBe(10);

  step.close(false);

  expect(pager.getState().step).toBe(4);

  step = pager.advance();

  expect(step.skip).toBe(40);
  expect(step.take).toBe(10);

  step.close(true);

  expect(pager.getState().step).toBe(5);

  pager.reset()

  expect(pager.getState().step).toBe(0);
});

test("utils", () => {
    expect(OffsetPager.finished(0, 10)).toBe(true)
    expect(OffsetPager.finished(5, 10)).toBe(true)
    expect(OffsetPager.finished(10, 10)).toBe(false)
    expect(OffsetPager.finished(20, 10)).toBe(false)
})
