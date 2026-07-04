import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ValidationQueue } from "@/components/studio/validation-queue";
import { IdentityTest } from "@/components/studio/identity-test";
import { ImageBank } from "@/components/studio/image-bank";

export default function StudioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl text-ink">Studio IA</h1>
        <p className="mt-1 text-stone">
          Chaque suggestion vient d&apos;un fait réel des autres modules — vous validez, rien ne part sans vous.
        </p>
      </div>

      <Tabs defaultValue="validation">
        <TabsList variant="line">
          <TabsTrigger value="validation">File de validation</TabsTrigger>
          <TabsTrigger value="identite">Test d&apos;identité</TabsTrigger>
          <TabsTrigger value="images">Banque d&apos;images</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="mt-6">
          <ValidationQueue />
        </TabsContent>

        <TabsContent value="identite" className="mt-6">
          <IdentityTest />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <ImageBank />
        </TabsContent>
      </Tabs>
    </div>
  );
}
