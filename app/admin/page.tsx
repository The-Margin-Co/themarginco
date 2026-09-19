import { redirect } from "next/navigation";
import { DEFAULT_ADMIN_PATH } from "@/lib/auth";

export default function AdminIndexPage() {
  redirect(DEFAULT_ADMIN_PATH);
}
