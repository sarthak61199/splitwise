import { ApiResponse } from "@/types/api";
import { cookies } from "next/headers";
import AddExpense from "./add-expense";
import SplitView from "./split-view";

const getGroup = async (
  groupId: string
): Promise<
  ApiResponse<{
    group: {
      name: string;
      members: {
        name: string;
        id: string;
      }[];
    };
  }>
> => {
  const cookieStore = await cookies();

  const response = await fetch(`http://localhost:3000/api/groups/${groupId}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const result = await response.json();

  return result;
};

const getExpenses = async (
  groupId: string
): Promise<
  ApiResponse<{
    expenses: {
      id: string;
      amount: number;
      description: string;
      date: Date;
      paidBy: {
        id: string;
        name: string;
      };
      shares: {
        amount: string;
        user: {
          id: string;
          name: string;
        };
      }[];
    }[];
  }>
> => {
  const cookieStore = await cookies();

  const response = await fetch(
    `http://localhost:3000/api/groups/${groupId}/expenses`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    }
  );

  const result = await response.json();

  return result;
};

async function Expenses({ groupId }: { groupId: string }) {
  const groupPromise = getGroup(groupId);
  const expensesPromise = getExpenses(groupId);

  const [groupData, expenseData] = await Promise.all([
    groupPromise,
    expensesPromise,
  ]);

  const members = groupData?.data?.group?.members || [];
  const expenses = expenseData?.data.expenses || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
        <AddExpense members={members} />
      </div>

      <div className="overflow-x-auto">
        {/* TODO: CHANGE THIS TO SHADCN TABLE */}
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                View Split
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ₹{expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expense.paidBy.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SplitView
                    expenseName={expense.description}
                    split={expense.shares}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expenses;
