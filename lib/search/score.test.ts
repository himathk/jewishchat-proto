import { describe, expect, it } from "vitest";
import { parseQuery, searchGroups } from "./score";
import { GROUPS } from "@/lib/data/groups";

describe("parseQuery", () => {
  it("extracts a location named in the query", () => {
    expect(parseQuery("roofing contractors in Lakewood").location).toBe("lakewood");
  });

  it("extracts a member-count floor from 'over N members'", () => {
    expect(parseQuery("business forums with over 100 members").minMembers).toBe(100);
  });

  it("extracts a member-count floor from 'N+'", () => {
    expect(parseQuery("groups with 500+ members").minMembers).toBe(500);
  });

  it("drops stopwords from the term list", () => {
    expect(parseQuery("find me a group for roofing")).toMatchObject({
      terms: ["roofing"],
    });
  });
});

describe("searchGroups", () => {
  it("returns nothing for an empty query", () => {
    expect(searchGroups("")).toEqual([]);
    expect(searchGroups("   ")).toEqual([]);
  });

  it("never returns a suspended group (FR-GS-02)", () => {
    const results = searchGroups("support circle manchester chronic illness", GROUPS);
    expect(results.some((r) => r.group.id === "g-24")).toBe(false);
  });

  it("orders results by descending confidence (FR-AI-06)", () => {
    const results = searchGroups("kosher food in Miami");
    expect(results.length).toBeGreaterThan(1);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
    }
  });

  it("ranks the Lakewood roofing group first for the SRS example query", () => {
    const results = searchGroups("Roofing Contractors in Lakewood with financing");
    expect(results[0].group.id).toBe("g-01");
  });

  it("ranks the Florida business forum first for the SRS example query", () => {
    const results = searchGroups("Business forums in Florida with over 100 members");
    expect(results[0].group.id).toBe("g-22");
  });

  it("demotes groups that fall below an explicit member floor", () => {
    const results = searchGroups("marketplace with over 3000 members");
    const monsey = results.find((r) => r.group.id === "g-17"); // 5020 members
    const london = results.find((r) => r.group.id === "g-18"); // 1660 members
    expect(monsey).toBeDefined();
    expect(london).toBeDefined();
    expect(monsey!.confidence).toBeGreaterThan(london!.confidence);
  });

  it("clamps confidence to the 0..1 range", () => {
    for (const r of searchGroups("lakewood contractors network roofing financing")) {
      expect(r.confidence).toBeGreaterThan(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});
