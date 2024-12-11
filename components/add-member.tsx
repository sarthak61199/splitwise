"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError, ApiResponse } from "@/types/api";
import { addMemberSchema, AddMemberType } from "@/validation/groups";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function AddMember() {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const form = useForm<AddMemberType>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(addMemberSchema),
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: AddMemberType) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/members`,
        {
          credentials: "include",
          method: "POST",
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

      form.reset();

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
    <Form {...form}>
      <form className="flex gap-2 mb-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Add
        </Button>
      </form>
    </Form>
  );
}

export default AddMember;
