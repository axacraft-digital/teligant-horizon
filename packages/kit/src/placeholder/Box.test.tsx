import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Box } from "./Box";

describe("Box (Chapter 1 placeholder)", () => {
  it("renders its children", () => {
    render(<Box data-testid="box">hello horizon</Box>);
    const el = screen.getByTestId("box");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("hello horizon");
  });

  it("forwards className", () => {
    render(
      <Box data-testid="box" className="px-4">
        x
      </Box>,
    );
    expect(screen.getByTestId("box")).toHaveClass("px-4");
  });
});
