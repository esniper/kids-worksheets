import MixWorksheetView from "@/components/mix/MixWorksheetView";
import { parseMixParams } from "@/lib/sheet-config";

type SP = Promise<{
  drill?: string;
  dcount?: string;
  from?: string;
  to?: string;
  big?: string;
  bcount?: string;
  ax?: string;
  ay?: string;
  acarry?: string;
  sx?: string;
  sy?: string;
  sborrow?: string;
}>;

export default async function MixWorksheetPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const config = parseMixParams(await searchParams);
  return <MixWorksheetView config={config} />;
}
