import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "./App";

function renderRoute(route) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CupPulse public routes", () => {
  it("provides a keyboard skip link to the main content", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { source: "cached", stale: false },
      }),
    });

    renderRoute("/");

    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("renders the home identity and freshness state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: {
          source: "cached",
          stale: true,
          generatedAt: "2026-06-14T00:00:00.000Z",
        },
      }),
    });

    renderRoute("/");

    expect(
      await screen.findByRole("heading", { name: /heartbeat of the world cup/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/cached data/i)).toBeInTheDocument();
  });

  it.each([
    ["/live", "Live matches"],
    ["/fixtures", "Fixtures"],
    ["/results", "Results"],
    ["/matches/development-fallback-match", "Match centre"],
    ["/matches/development-fallback-match/prediction", "Match prediction"],
    ["/matches/development-fallback-match/summary", "Match summary"],
  ])("renders %s as the %s page", async (route, heading) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: route.includes("development-fallback-match") ? {} : [],
        meta: { source: "mock", stale: true, generatedAt: new Date().toISOString() },
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      }),
    });

    renderRoute(route);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: new RegExp(`^${heading}$`, "i"),
      }),
    ).toBeInTheDocument();
  });

  it("provides a labeled fixture search control", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { source: "cached", stale: false, generatedAt: new Date().toISOString() },
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      }),
    });

    renderRoute("/fixtures");

    expect(
      await screen.findByRole("searchbox", { name: /search fixtures/i }),
    ).toBeInTheDocument();
  });

  it("exposes match score as a named region", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: "development-fallback-match",
          status: "scheduled",
          homeTeamId: "mexico",
          awayTeamId: "canada",
          score: { home: null, away: null },
        },
        meta: { source: "mock", stale: true, generatedAt: new Date().toISOString() },
      }),
    });

    renderRoute("/matches/development-fallback-match");

    expect(
      await screen.findByRole("region", { name: /match score/i }),
    ).toBeInTheDocument();
  });

  it.each([
    ["/standings", "table", "World Cup standings"],
    ["/bracket", "region", "Knockout bracket"],
    ["/teams", "searchbox", "Search teams"],
    ["/players", "searchbox", "Search players"],
  ])("renders the semantic data surface for %s", async (route, role, name) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { source: "cached", stale: false, generatedAt: new Date().toISOString() },
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      }),
    });

    renderRoute(route);

    expect(await screen.findByRole(role, { name })).toBeInTheDocument();
  });

  it("labels a team squad with the team name", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (request) => {
      const url = String(request);
      return {
        ok: true,
        json: async () => ({
          data: url.includes("/players?")
            ? []
            : { id: "canada", name: "Canada", code: "CAN" },
          meta: {
            source: "cached",
            stale: false,
            generatedAt: new Date().toISOString(),
          },
          pagination: { page: 1, limit: 100, total: 0, pages: 0 },
        }),
      };
    });

    renderRoute("/teams/canada");

    expect(
      await screen.findByRole("region", { name: "Canada squad" }),
    ).toBeInTheDocument();
  });
});
