import { IPhoneFrame } from "@/components/studio/iphone-frame";
import { InstagramPostRender } from "@/components/studio/renders/instagram-post-render";
import { FacebookPostRender } from "@/components/studio/renders/facebook-post-render";
import { StoryRender } from "@/components/studio/renders/story-render";
import type { FormatContenu, ReseauPlateforme } from "@/lib/mock-data";

export function PostPreview({
  plateforme,
  format,
  photos,
  legende,
  hashtags,
  musique,
}: {
  plateforme: ReseauPlateforme;
  format: FormatContenu;
  photos: string[];
  legende: string;
  hashtags: string[];
  musique?: string;
}) {
  const photosAffichees = photos.length > 0 ? photos : ["ph1"];

  if (format === "story") {
    return (
      <IPhoneFrame statusBarStyle="light">
        <StoryRender plateforme={plateforme} photos={photosAffichees} legende={legende} musique={musique} />
      </IPhoneFrame>
    );
  }

  return (
    <IPhoneFrame statusBarStyle="dark">
      {plateforme === "Instagram" ? (
        <InstagramPostRender photos={photosAffichees} legende={legende} hashtags={hashtags} />
      ) : (
        <FacebookPostRender photos={photosAffichees} legende={legende} />
      )}
    </IPhoneFrame>
  );
}
