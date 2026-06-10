import ArithmeticWorksheetView from "@/components/arithmetic/WorksheetView";
import { parseWorksheetParams } from "@/lib/sheet-config";

type SP = Promise<{
  mode?: string;
  x?: string;
  y?: string;
  carry?: string;
  count?: string;
}>;

export default async function AdditionWorksheetPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const config = parseWorksheetParams("add", await searchParams);
  return <ArithmeticWorksheetView op="add" config={config} />;
}
