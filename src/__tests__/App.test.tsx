import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

jest.mock("../router/AppRouter", () => ({
  AppRouter: () => <div>App router mock</div>,
}));

describe("App", () => {
  test("renderiza AppRouter", () => {
    render(<App />);
    expect(screen.getByText("App router mock")).toBeInTheDocument();
  });
});
