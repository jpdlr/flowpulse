import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("FlowPulse App", () => {
  it("renders dashboard title", () => {
    render(<App />);
    expect(screen.getByText(/Latency Stream Playground/i)).toBeInTheDocument();
  });

  it("toggles stream button label", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: "Pause stream" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Resume stream" })).toBeInTheDocument();
  });
});
