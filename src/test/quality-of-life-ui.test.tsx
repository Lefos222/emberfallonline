import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Panel } from "@/game/ui";

/**
 * The small conveniences added for quality of life: Escape closes the window on top.
 */

describe("Escape closes the topmost window", () => {
  it("closes only the window opened last", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Panel title="Forge" onClose={outer}>
          <span>forge body</span>
        </Panel>
        <Panel title="Crafting" onClose={inner}>
          <span>crafting body</span>
        </Panel>
      </>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("leaves the window alone when another key is pressed", () => {
    const close = vi.fn();
    render(
      <Panel title="Armory" onClose={close}>
        <span>bag</span>
      </Panel>,
    );
    fireEvent.keyDown(window, { key: "Enter" });
    expect(close).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
