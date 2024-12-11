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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError, ApiResponse } from "@/types/api";
import { createGroupSchema, CreateGroupType } from "@/validation/groups";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function NewGroup() {
  const router = useRouter();
  const form = useForm<CreateGroupType>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: CreateGroupType) => {
    try {
      const response = await fetch(`http://localhost:3000/api/groups`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message);
      }

      const result: ApiResponse<{
        message: string;
        data: Record<string, never>;
      }> = await response.json();

      form.reset();

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

  const isLoading = form.formState.isSubmitting;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 px-4 py-2">
          <Plus size={18} />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default NewGroup;
