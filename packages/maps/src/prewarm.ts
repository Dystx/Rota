export async function prewarm(): Promise<void> {
  const { prewarmMapbox } = await import("./components/mount-provider");
  await prewarmMapbox();
}
