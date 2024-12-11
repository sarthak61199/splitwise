import NewGroup from "@/components/new-group";
import { Button } from "@/components/ui/button";
import { ApiResponse } from "@/types/api";
import { ChevronRight, LogOut, Plus, Users } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

const getGroups = async (): Promise<
  ApiResponse<{ groups: { id: string; name: string }[] }>
> => {
  const cookieStore = await cookies();

  const response = await fetch("http://localhost:3000/api/groups", {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const result = await response.json();

  return result;
};

async function Dashboard() {
  const result = await getGroups();

  const groups = result.data?.groups || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-semibold text-indigo-600">
              Splitwise
            </div>
            <Button className="flex items-center gap-2" variant={"secondary"}>
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
          <NewGroup />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create a group to start splitting expenses with friends
            </p>
            <Button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mx-auto">
              <Plus size={18} />
              Create Your First Group
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
