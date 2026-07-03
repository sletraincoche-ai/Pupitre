import { CrmView } from "@/components/crm-view";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Clients</h1>
        <p className="mt-1 text-stone">
          CRM de la maison — filtrez vos segments et relancez en un clic.
        </p>
      </div>
      <CrmView />
    </div>
  );
}
