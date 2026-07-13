import { afterAll, beforeAll, describe, expect, it } from "vitest";

const adminUserId = "00000000-0000-4000-8000-000000000123";
const reviewerUserId = "00000000-0000-4000-8000-000000000124";

describe("PostgreSQL catalog and operations repositories", () => {
  let ownerPool: import("pg").Pool;
  let adminActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let reviewerActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let repos: typeof import("./catalog-postgres");

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.reviewers where id = $1", ["catalog-reviewer"]);
    await ownerPool.query("delete from app.partners where id = $1", ["catalog-partner"]);
    await ownerPool.query("delete from app.regions where id = $1", ["catalog-region"]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[adminUserId, reviewerUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[adminUserId, reviewerUserId]]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Catalog Admin', 'catalog-admin@example.test', true), ($2, 'Catalog Reviewer', 'catalog-reviewer@example.test', true)",
      [adminUserId, reviewerUserId]
    );
    await ownerPool.query(
      "insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'admin', 'Catalog Admin'), ($2, 'reviewer', 'Catalog Reviewer')",
      [adminUserId, reviewerUserId]
    );
    repos = await import("./catalog-postgres");
    const { loadPostgresAuthorizationContext } = await import("./actor");
    adminActor = await loadPostgresAuthorizationContext(adminUserId);
    reviewerActor = await loadPostgresAuthorizationContext(reviewerUserId);
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from app.reviewers where id = $1", ["catalog-reviewer"]);
    await ownerPool.query("delete from app.partners where id = $1", ["catalog-partner"]);
    await ownerPool.query("delete from app.regions where id = $1", ["catalog-region"]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[adminUserId, reviewerUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[adminUserId, reviewerUserId]]);
    await ownerPool.end();
  }, 30000);

  it("keeps admin catalog writes on the actor/RLS boundary and permits public partner reads", async () => {
    expect(adminActor).not.toBeNull();
    expect(reviewerActor).not.toBeNull();

    const region = await repos.createPostgresRegion(
      {
        id: "catalog-region",
        name: "Catalog Region",
        countrySlug: "portugal",
        bestFor: ["slow travel"],
        seasonality: "spring",
        launchStatus: "Active",
        description: "A test region"
      },
      adminActor!
    );
    expect(region).toMatchObject({ id: "catalog-region", name: "Catalog Region" });
    await expect(repos.listPostgresRegions(10, reviewerActor!)).resolves.toEqual([]);
    await expect(repos.updatePostgresRegion("catalog-region", { description: "Updated" }, adminActor!)).resolves.toMatchObject({ description: "Updated" });

    const partner = await repos.createPostgresPartner(
      {
        id: "catalog-partner",
        name: "Catalog Partner",
        type: "transport",
        coverageRegions: ["porto"],
        status: "Active",
        notes: "Useful but independent",
        link: "https://example.test/partner",
        isAffiliate: false
      },
      adminActor!
    );
    expect(partner.id).toBe("catalog-partner");
    await expect(repos.listPostgresPartners(10)).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "catalog-partner" })]));

    const reviewer = await repos.createPostgresReviewer(
      {
        id: "catalog-reviewer",
        name: "Catalog Reviewer",
        country: "Portugal",
        regions: ["porto"],
        languages: ["pt", "en"],
        specialties: ["family"],
        status: "Active",
        rating: 4.5,
        bio: "Knows the region.",
        responsePromise: "Within one business day"
      },
      adminActor!
    );
    expect(reviewer).toMatchObject({ id: "catalog-reviewer", rating: 4.5 });
    await expect(repos.getPostgresReviewerById("catalog-reviewer", adminActor!)).resolves.toMatchObject({ id: "catalog-reviewer" });
  });
});
