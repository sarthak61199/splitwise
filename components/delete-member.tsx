"use client";

import { Button } from "@/components/ui/button";
import { ApiError, ApiResponse } from "@/types/api";
import { Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function DeleteMember({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();

  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/members?memberId=${memberId}`,
        {
          credentials: "include",
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message);
      }

      const result: ApiResponse<{
        message: string;
        data: Record<string, never>;
      }> = await response.json();

      toast.success(result.message);

      router.refresh();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={onDelete} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 text-red-500" />
      )}
    </Button>
  );
}

export default DeleteMember;
