import { afterAll, beforeAll, describe, expect, it } from "vitest";

const specialistUserId = "00000000-0000-4000-8000-000000000101";
const adminUserId = "00000000-0000-4000-8000-000000000102";

describe("PostgreSQL specialist profiles", () => {
  let ownerPool: import("pg").Pool;
  let specialistActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let adminActor: Awaited<ReturnType<typeof import("./actor").loadPostgresAuthorizationContext>>;
  let getPostgresSpecialistProfileByUserId: typeof import("./specialists-postgres").getPostgresSpecialistProfileByUserId;
  let upsertPostgresSpecialistProfile: typeof import("./specialists-postgres").upsertPostgresSpecialistProfile;
  let listPostgresSpecialists: typeof import("./specialists-postgres").listPostgresSpecialists;
  let setPostgresSpecialistVerified: typeof import("./specialists-postgres").setPostgresSpecialistVerified;
  let getPostgresSpecialistCapabilities: typeof import("./specialists-postgres").getPostgresSpecialistCapabilities;
  let setPostgresSpecialistCapabilities: typeof import("./specialists-postgres").setPostgresSpecialistCapabilities;

  beforeAll(async () => {
    process.env.DATABASE_URL = "postgresql:///rumia?user=rumia_app";
    const { Pool } = await import("pg");
    ownerPool = new Pool({ connectionString: "postgresql:///rumia?user=rumia_owner", max: 1 });
    await ownerPool.query("delete from app.specialist_profiles where user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from app.capability_grants where subject_user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query(
      "insert into authn.user (id, name, email, email_verified) values ($1, 'Specialist', 'specialist-postgres@example.test', true), ($2, 'Specialist Admin', 'specialist-admin@example.test', true)",
      [specialistUserId, adminUserId]
    );
    await ownerPool.query(
      "insert into app.user_profiles (user_id, app_role, display_name) values ($1, 'reviewer', 'Specialist'), ($2, 'admin', 'Specialist Admin')",
      [specialistUserId, adminUserId]
    );
    await ownerPool.query(
      "insert into app.capability_grants (subject_user_id, app_role, capability, reason, granted_by) values ($1, 'admin', 'specialists:verify', 'specialist integration test', $1)",
      [adminUserId]
    );

    ({
      getPostgresSpecialistProfileByUserId,
      upsertPostgresSpecialistProfile,
      listPostgresSpecialists,
      setPostgresSpecialistVerified,
      getPostgresSpecialistCapabilities,
      setPostgresSpecialistCapabilities
    } = await import("./specialists-postgres"));
    const { loadPostgresAuthorizationContext } = await import("./actor");
    specialistActor = await loadPostgresAuthorizationContext(specialistUserId);
    adminActor = await loadPostgresAuthorizationContext(adminUserId);
  }, 30000);

  afterAll(async () => {
    await ownerPool.query("delete from app.specialist_profiles where user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from app.capability_grants where subject_user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from app.user_profiles where user_id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.query("delete from authn.user where id = any($1::uuid[])", [[specialistUserId, adminUserId]]);
    await ownerPool.end();
  }, 30000);

  it("keeps profile and capability access scoped to the specialist or verification admin", async () => {
    expect(specialistActor).not.toBeNull();
    expect(adminActor).not.toBeNull();

    const created = await upsertPostgresSpecialistProfile(
      specialistUserId,
      {
        fullName: "Portugal Specialist",
        regionsCovered: [],
        tier3OnCall: true,
        tier4LicensedGuide: false,
        hourlyRate: 75,
        bio: "Local context and careful pacing.",
        photoUrl: null
      },
      specialistActor!
    );
    expect(created).toMatchObject({ userId: specialistUserId, fullName: "Portugal Specialist", isVerified: false });

    await setPostgresSpecialistCapabilities(created!.id, "skill", ["Porto", "Family pacing"], specialistActor!);
    await setPostgresSpecialistCapabilities(created!.id, "language", ["pt", "en"], specialistActor!);
    await expect(getPostgresSpecialistCapabilities(created!.id, specialistActor!)).resolves.toEqual({
      skills: ["Family pacing", "Porto"],
      languages: ["en", "pt"]
    });

    await expect(listPostgresSpecialists(10, specialistActor!)).resolves.toEqual([]);
    await expect(listPostgresSpecialists(10, adminActor!)).resolves.toHaveLength(1);
    await expect(getPostgresSpecialistProfileByUserId(specialistUserId, specialistActor!)).resolves.toMatchObject({ id: created!.id });
    await expect(setPostgresSpecialistVerified(created!.id, true, adminActor!)).resolves.toMatchObject({ isVerified: true });

    await expect(
      upsertPostgresSpecialistProfile(
        specialistUserId,
        { fullName: "Changed by admin", regionsCovered: [], tier3OnCall: true, tier4LicensedGuide: false, hourlyRate: 80 },
        adminActor!
      )
    ).resolves.toMatchObject({ fullName: "Changed by admin" });
  });
});
