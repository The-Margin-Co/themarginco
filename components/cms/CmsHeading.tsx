import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { at, EditableText, type Bind } from "./Editable";

export type HeadingValue = { eyebrow?: string; title: string; highlight?: string; description?: string };

/** Section heading (eyebrow, title, yellow highlight, intro) with every piece bound to a CMS field. */
export async function CmsHeading({
  bind,
  value,
  align = "center",
  as: Heading = "h2",
  className,
}: {
  bind: Bind;
  value: HeadingValue;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {value.eyebrow !== undefined && value.eyebrow !== "" && (
        <Badge dot>
          <EditableText bind={at(bind, "eyebrow")} value={value.eyebrow} />
        </Badge>
      )}
      <Heading
        className={cn(
          "mt-5 text-balance font-extrabold tracking-tight",
          Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl",
        )}
      >
        <EditableText bind={at(bind, "title")} value={value.title} />
        {value.highlight !== undefined && value.highlight !== "" && (
          <>
            {" "}
            <EditableText bind={at(bind, "highlight")} value={value.highlight} className="text-highlight" />
          </>
        )}
      </Heading>
      {value.description !== undefined && value.description !== "" && (
        <EditableText
          bind={at(bind, "description")}
          value={value.description}
          as="p"
          className="mt-5 block text-pretty text-base leading-relaxed text-muted sm:text-lg"
        />
      )}
    </div>
  );
}
