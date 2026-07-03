import { VisitList } from "@/components/visit-list";
import { VisitStats } from "@/components/visit-stats";

export default function VisitesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Œnotourisme</h1>
        <p className="mt-1 text-stone">
          Visites et dégustations de la semaine.
        </p>
      </div>
      <VisitStats />
      <VisitList />
    </div>
  );
}
