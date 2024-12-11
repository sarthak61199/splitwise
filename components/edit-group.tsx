"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError, ApiResponse } from "@/types/api";
import { updateGroupSchema, UpdateGroupType } from "@/validation/groups";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function EditGroup({ name }: { name: string }) {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const form = useForm<UpdateGroupType>({
    defaultValues: {
      name,
    },
    resolver: zodResolver(updateGroupSchema),
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: UpdateGroupType) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}`,
        {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
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
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-3 py-2" variant={"ghost"}>
          <Edit size={18} />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="mb-4 space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Name" autoComplete="name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditGroup;
