import type { VideoTestimonial } from "@/lib/types";
import type { VideoTestimonialField } from "@/lib/validation";

export type VideoTestimonialFormValues = Record<Exclude<VideoTestimonialField, "status" | "sort_order">, string> & {
  sort_order: number;
};

export const EMPTY_VIDEO_TESTIMONIAL: VideoTestimonialFormValues = {
  name: "",
  role: "",
  company: "",
  video_url: "",
  poster_image: "",
  poster_image_alt: "",
  sort_order: 0,
};

export function toFormValues(video: VideoTestimonial): VideoTestimonialFormValues {
  return {
    name: video.name,
    role: video.role ?? "",
    company: video.company ?? "",
    video_url: video.video_url,
    poster_image: video.poster_image,
    poster_image_alt: video.poster_image_alt,
    sort_order: video.sort_order,
  };
}
