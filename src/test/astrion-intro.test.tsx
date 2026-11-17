import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AstrionIntro } from "@/astrion/Intro";

afterEach(() => { cleanup(); vi.useRealTimers(); });

it("automatically completes the four-second intro without interaction", () => {
  vi.useFakeTimers();
  const done = vi.fn();
  render(<AstrionIntro onDone={done} />);
  act(() => vi.advanceTimersByTime(3999));
  expect(done).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(done).toHaveBeenCalledTimes(1);
});

it("allows skipping the automatic intro", () => {
  const done = vi.fn();
  const view = render(<AstrionIntro onDone={done} />);
  fireEvent.click(view.getByRole("button", { name: "Skip intro" }));
  expect(done).toHaveBeenCalledTimes(1);
});