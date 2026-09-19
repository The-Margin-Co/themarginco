"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import type { EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CodeXml,
  Columns3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Rows3,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { RICH_CONTENT_CLASS } from "@/lib/rich-content";
import { altFromFilename, imageFileError, uploadImage } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

const BLOCK_FORMATS = [
  { value: "p", label: "Paragraph" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
] as const;
const FONTS = ["Arial", "Georgia", "Tahoma", "Times New Roman", "Verdana", "Courier New"];
const SIZES = ["14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const ALIGNMENTS = [
  { value: "left", label: "Align left", icon: AlignLeft },
  { value: "center", label: "Align center", icon: AlignCenter },
  { value: "right", label: "Align right", icon: AlignRight },
  { value: "justify", label: "Justify", icon: AlignJustify },
] as const;

function imageFiles(list: FileList | null | undefined) {
  return Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
}

function isAllowedHref(href: string) {
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);
}

export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Start writing your article…",
  invalid = false,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [uploads, setUploads] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TipTap keeps the first callbacks it sees, so route them through refs that always hold the latest props.
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  });

  const insertImages = useCallback(async (view: EditorView, files: File[]) => {
    setUploadError(null);
    for (const file of files) {
      const problem = imageFileError(file);
      if (problem) {
        setUploadError(problem);
        continue;
      }
      setUploads((count) => count + 1);
      try {
        const src = await uploadImage(file);
        const node = view.state.schema.nodes.image.create({ src, alt: altFromFilename(file.name) });
        view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploads((count) => count - 1);
      }
    }
  }, []);

  const [extensions] = useState(() => [
    StarterKit.configure({ heading: { levels: [2, 3, 4, 5, 6] }, link: false }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer" },
    }),
    Image,
    TableKit.configure({ table: { resizable: false } }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyleKit,
    Subscript,
    Superscript,
    Placeholder.configure({ placeholder }),
    CharacterCount,
  ]);
  const [initialContent] = useState(value);

  const editorProps = useMemo(
    () => ({
      attributes: {
        id,
        class: cn(RICH_CONTENT_CLASS, "tiptap-editor min-h-[28rem] px-6 py-5 focus:outline-none"),
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Post content",
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        const files = imageFiles(event.clipboardData?.files);
        if (files.length === 0) return false;
        void insertImages(view, files);
        return true;
      },
      handleDrop: (view: EditorView, event: DragEvent) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        void insertImages(view, files);
        return true;
      },
    }),
    [id, invalid, describedBy, insertImages],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent,
    editorProps,
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getHTML()),
    onBlur: () => onBlurRef.current?.(),
  });

  const ui = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      const level = [2, 3, 4, 5, 6].find((l) => e.isActive("heading", { level: l }));
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        subscript: e.isActive("subscript"),
        superscript: e.isActive("superscript"),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        link: e.isActive("link"),
        image: e.isActive("image"),
        table: e.isActive("table"),
        align: ALIGNMENTS.find((a) => e.isActive({ textAlign: a.value }))?.value ?? "left",
        block: level ? `h${level}` : "p",
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        words: e.storage.characterCount.words(),
        linkHref: (e.getAttributes("link").href as string | undefined) ?? "",
        imageAlt: (e.getAttributes("image").alt as string | undefined) ?? "",
      };
    },
  });

  if (!editor || !ui) {
    return <div className="min-h-[34rem] animate-pulse rounded-xl border border-line bg-ink/70" />;
  }

  const chain = () => editor.chain().focus();

  function toggleSource() {
    if (!editor) return;
    if (sourceMode) {
      editor.commands.setContent(sourceHtml);
      onChange(editor.getHTML());
      setSourceMode(false);
    } else {
      setSourceHtml(editor.getHTML());
      setSourceMode(true);
      setLinkOpen(false);
    }
  }

  function applyBlock(format: string) {
    if (format === "p") chain().setParagraph().run();
    else chain().toggleHeading({ level: Number(format[1]) as 2 | 3 | 4 | 5 | 6 }).run();
  }

  function openLink() {
    setLinkDraft(ui?.linkHref || "https://");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = linkDraft.trim();
    if (!href || href === "https://") {
      chain().extendMarkRange("link").unsetLink().run();
    } else if (isAllowedHref(href)) {
      if (editor.state.selection.empty && !editor.isActive("link")) {
        chain().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        chain().extendMarkRange("link").setLink({ href }).run();
      }
    } else {
      return;
    }
    setLinkOpen(false);
  }

  const disabled = sourceMode;
  const words = ui.words;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-ink/70 transition-colors focus-within:border-accent/70",
        invalid ? "border-danger/80" : "border-line",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const files = imageFiles(event.target.files);
          event.target.value = "";
          if (files.length) void insertImages(editor.view, files);
        }}
      />

      <div role="toolbar" aria-label="Formatting" className="sticky top-[4.5rem] z-10 border-b border-line bg-ink-2/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
          <button
            type="button"
            onClick={toggleSource}
            aria-pressed={sourceMode}
            title="Edit HTML source"
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors",
              sourceMode ? "bg-accent text-on-accent" : "text-muted hover:bg-fg/5 hover:text-fg",
            )}
          >
            <CodeXml aria-hidden className="size-4" /> HTML
          </button>
          <Divider />
          <Tool label="Bold (⌘B)" active={ui.bold} disabled={disabled} onClick={() => chain().toggleBold().run()}><Bold /></Tool>
          <Tool label="Italic (⌘I)" active={ui.italic} disabled={disabled} onClick={() => chain().toggleItalic().run()}><Italic /></Tool>
          <Tool label="Underline (⌘U)" active={ui.underline} disabled={disabled} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon /></Tool>
          <Tool label="Strikethrough" active={ui.strike} disabled={disabled} onClick={() => chain().toggleStrike().run()}><Strikethrough /></Tool>
          <Tool label="Subscript" active={ui.subscript} disabled={disabled} onClick={() => chain().toggleSubscript().run()}><SubscriptIcon /></Tool>
          <Tool label="Superscript" active={ui.superscript} disabled={disabled} onClick={() => chain().toggleSuperscript().run()}><SuperscriptIcon /></Tool>
          <Divider />
          <Tool label="Bulleted list" active={ui.bulletList} disabled={disabled} onClick={() => chain().toggleBulletList().run()}><List /></Tool>
          <Tool label="Numbered list" active={ui.orderedList} disabled={disabled} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></Tool>
          <Tool label="Quote" active={ui.blockquote} disabled={disabled} onClick={() => chain().toggleBlockquote().run()}><Quote /></Tool>
          <Tool label="Divider line" disabled={disabled} onClick={() => chain().setHorizontalRule().run()}><Minus /></Tool>
          <Divider />
          <Tool label="Insert link" active={ui.link || linkOpen} disabled={disabled} onClick={openLink}><LinkIcon /></Tool>
          <Tool label="Remove link" disabled={disabled || !ui.link} onClick={() => chain().extendMarkRange("link").unsetLink().run()}><Unlink /></Tool>
          <Tool label="Upload image" disabled={disabled} onClick={() => fileInputRef.current?.click()}><ImagePlus /></Tool>
          <Tool
            label="Insert table"
            active={ui.table}
            disabled={disabled}
            onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon />
          </Tool>
          <Divider />
          {ALIGNMENTS.map(({ value: align, label, icon: Icon }) => (
            <Tool
              key={align}
              label={label}
              active={ui.align === align}
              disabled={disabled}
              onClick={() => chain().setTextAlign(align).run()}
            >
              <Icon />
            </Tool>
          ))}
          <Divider />
          <Tool label="Clear formatting" disabled={disabled} onClick={() => chain().unsetAllMarks().clearNodes().run()}><RemoveFormatting /></Tool>
          <Tool label="Undo (⌘Z)" disabled={disabled || !ui.canUndo} onClick={() => chain().undo().run()}><Undo2 /></Tool>
          <Tool label="Redo (⇧⌘Z)" disabled={disabled || !ui.canRedo} onClick={() => chain().redo().run()}><Redo2 /></Tool>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line/70 px-2 py-1.5">
          <ToolbarSelect label="Text style" value={ui.block} disabled={disabled} onChange={applyBlock}>
            {BLOCK_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </ToolbarSelect>
          <ToolbarSelect
            label="Font"
            value=""
            disabled={disabled}
            onChange={(font) => (font === "default" ? chain().unsetFontFamily().run() : chain().setFontFamily(font).run())}
          >
            <option value="" disabled>
              Font
            </option>
            <option value="default">Site default</option>
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </ToolbarSelect>
          <ToolbarSelect
            label="Font size"
            value=""
            disabled={disabled}
            onChange={(size) => (size === "default" ? chain().unsetFontSize().run() : chain().setFontSize(size).run())}
          >
            <option value="" disabled>
              Size
            </option>
            <option value="default">Default</option>
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size.replace("px", "")}
              </option>
            ))}
          </ToolbarSelect>
          <ColorInput label="Text color" swatch="A" disabled={disabled} onChange={(color) => chain().setColor(color).run()} />
          <ColorInput
            label="Highlight color"
            swatch="H"
            highlight
            disabled={disabled}
            onChange={(color) => chain().setBackgroundColor(color).run()}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => chain().unsetColor().unsetBackgroundColor().run()}
            className="h-8 rounded-md px-2 text-xs font-semibold text-muted transition-colors hover:bg-fg/5 hover:text-fg disabled:opacity-40"
          >
            Reset colors
          </button>
        </div>

        {linkOpen && !sourceMode && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line/70 bg-accent/[0.04] px-3 py-2">
            <label htmlFor={`${id}-link`} className="text-xs font-semibold text-fg">
              Link URL
            </label>
            <input
              id={`${id}-link`}
              type="text"
              inputMode="url"
              autoFocus
              value={linkDraft}
              onChange={(event) => setLinkDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
                if (event.key === "Escape") setLinkOpen(false);
              }}
              className="h-8 min-w-0 flex-1 rounded-md border border-line bg-ink px-2.5 text-sm text-fg focus:border-accent focus:outline-none"
              placeholder="https://example.com or /contact"
            />
            <button type="button" onClick={applyLink} className="h-8 rounded-md bg-accent px-3 text-xs font-bold text-on-accent">
              Apply
            </button>
            <button type="button" onClick={() => setLinkOpen(false)} className="h-8 rounded-md px-2 text-xs font-semibold text-muted hover:text-fg">
              Cancel
            </button>
            {linkDraft.trim() && linkDraft !== "https://" && !isAllowedHref(linkDraft.trim()) && (
              <p className="w-full text-xs text-danger">Links must start with https://, http://, mailto:, tel: or /.</p>
            )}
          </div>
        )}

        {ui.image && !sourceMode && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line/70 bg-accent/[0.04] px-3 py-2">
            <label htmlFor={`${id}-alt`} className="text-xs font-semibold text-fg">
              Image alt text
            </label>
            <input
              id={`${id}-alt`}
              type="text"
              value={ui.imageAlt}
              onChange={(event) => editor.commands.updateAttributes("image", { alt: event.target.value })}
              className="h-8 min-w-0 flex-1 rounded-md border border-line bg-ink px-2.5 text-sm text-fg focus:border-accent focus:outline-none"
              placeholder="Describe the image for screen readers and SEO"
            />
            <button
              type="button"
              onClick={() => chain().deleteSelection().run()}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-danger hover:bg-danger/10"
            >
              <Trash2 aria-hidden className="size-3.5" /> Remove image
            </button>
          </div>
        )}

        {ui.table && !sourceMode && (
          <div className="flex flex-wrap items-center gap-1 border-t border-line/70 bg-accent/[0.04] px-3 py-1.5 text-xs font-semibold">
            <span className="mr-1 text-fg">Table</span>
            <TableAction onClick={() => chain().addRowAfter().run()} icon={<Rows3 aria-hidden className="size-3.5" />}>Add row</TableAction>
            <TableAction onClick={() => chain().addColumnAfter().run()} icon={<Columns3 aria-hidden className="size-3.5" />}>Add column</TableAction>
            <TableAction onClick={() => chain().deleteRow().run()}>Delete row</TableAction>
            <TableAction onClick={() => chain().deleteColumn().run()}>Delete column</TableAction>
            <TableAction onClick={() => chain().toggleHeaderRow().run()}>Toggle header</TableAction>
            <TableAction danger onClick={() => chain().deleteTable().run()} icon={<Trash2 aria-hidden className="size-3.5" />}>
              Delete table
            </TableAction>
          </div>
        )}
      </div>

      {sourceMode ? (
        <textarea
          aria-label="HTML source"
          value={sourceHtml}
          onChange={(event) => setSourceHtml(event.target.value)}
          spellCheck={false}
          className="block min-h-[28rem] w-full resize-y bg-transparent px-6 py-5 font-mono text-xs leading-relaxed text-fg focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-ink-2/60 px-4 py-2 text-xs">
        <span>
          {words.toLocaleString()} {words === 1 ? "word" : "words"} · ~{Math.max(1, Math.round(words / 220))} min read
        </span>
        <span className="flex items-center gap-2">
          {uploads > 0 && (
            <span className="flex items-center gap-1.5 text-gold">
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> Uploading image…
            </span>
          )}
          {uploadError && <span className="text-danger">{uploadError}</span>}
          {uploads === 0 && !uploadError && <span className="hidden sm:inline">Tip: paste or drag images straight into the editor</span>}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-line" />;
}

function Tool({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
        active ? "bg-accent/15 text-gold" : "text-muted hover:bg-fg/5 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-line bg-ink px-2 text-xs font-medium text-fg focus:border-accent focus:outline-none disabled:opacity-40"
    >
      {children}
    </select>
  );
}

function ColorInput({
  label,
  swatch,
  highlight = false,
  disabled,
  onChange,
}: {
  label: string;
  swatch: string;
  highlight?: boolean;
  disabled?: boolean;
  onChange: (color: string) => void;
}) {
  return (
    <label
      title={label}
      className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-xs text-muted hover:bg-fg/5", disabled && "pointer-events-none opacity-40")}
    >
      <span className={cn("font-bold", highlight ? "rounded-sm bg-accent px-1 text-on-accent" : "text-fg underline decoration-accent decoration-2")}>
        {swatch}
      </span>
      <input
        type="color"
        aria-label={label}
        disabled={disabled}
        defaultValue={highlight ? "#facc15" : "#ffffff"}
        onChange={(event) => onChange(event.target.value)}
        className="h-6 w-7 cursor-pointer rounded border border-line bg-transparent p-0"
      />
    </label>
  );
}

function TableAction({
  onClick,
  icon,
  danger = false,
  children,
}: {
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1 rounded-md px-2 transition-colors",
        danger ? "text-danger hover:bg-danger/10" : "text-muted hover:bg-fg/5 hover:text-fg",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
