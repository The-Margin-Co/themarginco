import { CmsHeading } from "@/components/cms/CmsHeading";
import type { Bind } from "@/components/cms/Editable";
import { Container, Section } from "@/components/ui/Container";
import type { HomeContent } from "@/lib/cms/pages/home";
import { getVideoTestimonials } from "@/lib/video-testimonials";
import { VideoEmbed } from "./VideoEmbed";

// Cards are live-fetched from the `video_testimonials` table (like `caseStudies` above);
// this section only holds the heading copy.
export async function VideoTestimonials({ bind, content }: { bind: Bind; content: HomeContent["videoTestimonials"] }) {
  const videos = await getVideoTestimonials().catch((error: unknown) => {
    console.error(error);
    return [];
  });
  if (videos.length === 0) return null;

  return (
    <Section>
      <Container>
        <CmsHeading bind={bind} value={content} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {videos.map((video) => (
            <figure key={video.id} className="card overflow-hidden">
              <VideoEmbed videoUrl={video.video_url} posterUrl={video.poster_image} posterAlt={video.poster_image_alt} title={video.name} />
              <figcaption className="p-5">
                <div className="font-semibold text-fg">{video.name}</div>
                {(video.role || video.company) && (
                  <div className="text-sm text-muted">{[video.role, video.company].filter(Boolean).join(", ")}</div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
