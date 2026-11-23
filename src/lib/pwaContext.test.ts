import { describe, expect, it } from "vitest";
import { refuseAppWorker } from "./pwaContext";

describe("offline preview safety", () => {
  it("refuses development, embedded, preview and editor origins", () => {
    expect(refuseAppWorker(false, "localhost", false, "")).toBe(true);
    expect(refuseAppWorker(true, "nooralfurqan.app", true, "")).toBe(true);
    for (const host of ["id-preview--app.lovable.app", "preview-v2--app.gpt-eng.com", "project--app-dev.lovable.app", "a.lovableproject.com", "beta.lovable.dev"]) {
      expect(refuseAppWorker(true, host, false, "")).toBe(true);
    }
  });
  it("supports the kill switch on published domains", () => {
    expect(refuseAppWorker(true, "nooralfurqan.app", false, "?sw=off")).toBe(true);
  });
  it("allows published and custom domains, including unrelated preview labels", () => {
    for (const host of ["noor-alfurqan.lovable.app", "nooralfurqan.app", "www.nooralfurqan.app", "preview-v2--shop.example.com"]) {
      expect(refuseAppWorker(true, host, false, "")).toBe(false);
    }
  });
});