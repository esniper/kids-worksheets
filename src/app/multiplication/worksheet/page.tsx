import WorksheetView from "./WorksheetView";

type SP = Promise<{
  ioFrom?: string;
  ioTo?: string;
  rFrom?: string;
  rTo?: string;
}>;

function parseRange(
  from: string | undefined,
  to: string | undefined,
): { from: number; to: number } | null {
  if (from === undefined || to === undefined) return null;
  const f = Number.parseInt(from, 10);
  const t = Number.parseInt(to, 10);
  if (Number.isNaN(f) || Number.isNaN(t)) return null;
  const clampedF = Math.max(2, Math.min(20, f));
  const clampedT = Math.max(2, Math.min(20, t));
  if (clampedF > clampedT) return null;
  return { from: clampedF, to: clampedT };
}

export default async function WorksheetPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const inOrder = parseRange(sp.ioFrom, sp.ioTo);
  const random = parseRange(sp.rFrom, sp.rTo);
  return <WorksheetView inOrder={inOrder} random={random} />;
}
