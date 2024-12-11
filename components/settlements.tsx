import { ApiResponse } from "@/types/api";
import { ArrowRight, IndianRupee } from "lucide-react";
import { cookies } from "next/headers";

const getSettlements = async (
  groupId: string
): Promise<
  ApiResponse<{
    settlements: {
      id: string;
      amount: number;
      date: Date;
      fromUser: {
        name: string;
      };
      toUser: {
        name: string;
      };
    }[];
  }>
> => {
  const cookieStore = await cookies();

  const response = await fetch(
    `http://localhost:3000/api/groups/${groupId}/settlements`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  const result = await response.json();

  return result;
};

async function Settlements({ groupId }: { groupId: string }) {
  const result = await getSettlements(groupId);

  const settlements = result?.data?.settlements || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlements</h2>
      {settlements.length > 0 ? (
        <div className="space-y-3">
          {settlements.map((settlement) => (
            <div
              key={settlement.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <IndianRupee className="text-green-600" size={20} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {settlement.fromUser.name}
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                  <span className="font-medium">{settlement.toUser.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(settlement.date).toLocaleDateString()}
                </div>
              </div>
              <div className="font-semibold text-gray-900">
                ₹{settlement.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No settlements yet</div>
      )}
    </div>
  );
}

export default Settlements;
