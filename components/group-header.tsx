import DeleteGroup from "@/components/delete-group";
import EditGroup from "@/components/edit-group";
import MemberView from "@/components/member-view";
import { ApiResponse } from "@/types/api";
import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "./ui/button";

const getData = async (groupId: string) => {
  const cookieStore = await cookies();

  const response = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const result = await response.json();

  return result;
};

async function GroupHeader({ groupId }: { groupId: string }) {
  const result: ApiResponse<{
    group: {
      name: string;
      members: {
        name: string;
        id: string;
      }[];
    };
  }> = await getData(groupId);

  const group = result?.data?.group;
  const members = result?.data?.group?.members;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 items-center">
            <Button
              asChild
              variant={"ghost"}
              size={"icon"}
              className="[&_svg]:size-6"
            >
              <Link href={"/dashboard"}>
                <ChevronLeft />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{group?.name}</h1>
          </div>
          <p className="text-gray-500">{members.length} members</p>
        </div>
        <div className="flex gap-3">
          <MemberView members={members} />
          <EditGroup name={group?.name ?? ""} />
          <DeleteGroup />
        </div>
      </div>
    </div>
  );
}

export default GroupHeader;
