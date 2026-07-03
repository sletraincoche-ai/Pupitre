import { StudioQueue } from "@/components/studio-queue";
import { EditorialCalendar } from "@/components/editorial-calendar";

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Studio IA</h1>
        <p className="mt-1 text-stone">
          Validez les publications générées et suivez votre calendrier éditorial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <StudioQueue />
        </div>
        <div className="xl:col-span-2">
          <EditorialCalendar />
        </div>
      </div>
    </div>
  );
}
