import { redirect } from "next/navigation";

/**
 * /console — the operator console index.
 *
 * The 6 subroutes (`/console/{pipeline,workspace,messages,graph,metrics,config}`)
 * each render their own console page. The index exists so links like
 * `/console` (used in the "Plan a Trip" CTA's previous destination, in
 * devtools "open this app" links, and in some auth callbacks) resolve
 * to the operations pipeline — the highest-traffic console surface.
 */
export default function ConsoleIndex(): never {
  redirect("/console/pipeline");
}
