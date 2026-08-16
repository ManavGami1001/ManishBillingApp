"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteInvoice } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this invoice? Stock will be restored.")) {
          startTransition(() => {
            deleteInvoice(id);
          });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}