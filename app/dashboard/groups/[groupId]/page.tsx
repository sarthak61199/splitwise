import Expenses from "@/components/expenses";
import GroupHeader from "@/components/group-header";
import Settlements from "@/components/settlements";

export default async function Group({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const groupId = (await params).groupId;

  const group = {
    id: "1",
    name: "Weekend Trip",
    totalExpenses: 1250.75,
    members: [
      { id: "1", name: "Alice Smith", email: "alice@example.com" },
      { id: "2", name: "Bob Jones", email: "bob@example.com" },
      { id: "3", name: "Charlie Brown", email: "charlie@example.com" },
    ],
    balances: [
      { userId: "1", amount: 350 },
      { userId: "2", amount: -200 },
      { userId: "3", amount: -150 },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <GroupHeader groupId={groupId} />
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Balances</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {group.balances.map((balance) => (
              <div
                key={balance.userId}
                className={`p-4 rounded-lg ${
                  balance.amount > 0
                    ? "bg-green-50 text-green-700"
                    : balance.amount < 0
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <div className="text-sm mb-1">
                  {group.members.find((m) => m.id === balance.userId)?.name}
                </div>
                <div className="text-lg font-semibold">
                  {balance.amount > 0 ? "+" : ""}
                  {balance.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Expenses groupId={groupId} />
        <Settlements groupId={groupId} />
      </div>
    </div>
  );
}
