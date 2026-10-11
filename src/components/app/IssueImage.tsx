import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Shows a private issue photo through a short-lived signed URL. */
export function IssueImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("issue-images").createSignedUrl(path, 600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);
  if (!url) return <p className="text-xs text-muted-foreground">Loading photo…</p>;
  return <img src={url} alt="Reported issue" className="max-h-64 rounded-md border object-contain" />;
}
