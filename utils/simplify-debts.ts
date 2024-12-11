interface Node {
  id: string;
  balance: number;
}

interface Edge {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(balances: Record<string, number>): Edge[] {
  const nodes: Node[] = Object.entries(balances).map(([id, balance]) => ({
    id,
    balance: Number(balance.toFixed(2)),
  }));

  const activeNodes = nodes.filter((node) => Math.abs(node.balance) > 0.01);

  const transactions: Edge[] = [];

  while (activeNodes.length > 1) {
    const maxDebtor = activeNodes.reduce((prev, curr) =>
      curr.balance < prev.balance ? curr : prev
    );
    const maxCreditor = activeNodes.reduce((prev, curr) =>
      curr.balance > prev.balance ? curr : prev
    );

    const amount = Math.min(
      Math.abs(maxDebtor.balance),
      Math.abs(maxCreditor.balance)
    );

    transactions.push({
      from: maxDebtor.id,
      to: maxCreditor.id,
      amount: Number(amount.toFixed(2)),
    });

    maxDebtor.balance += amount;
    maxCreditor.balance -= amount;

    for (let i = activeNodes.length - 1; i >= 0; i--) {
      if (Math.abs(activeNodes[i].balance) < 0.01) {
        activeNodes.splice(i, 1);
      }
    }
  }

  return optimizeTransactions(transactions);
}

function optimizeTransactions(transactions: Edge[]): Edge[] {
  const graph = new Map<string, Map<string, number>>();

  transactions.forEach((tx) => {
    if (!graph.has(tx.from)) graph.set(tx.from, new Map());
    if (!graph.has(tx.to)) graph.set(tx.to, new Map());

    const fromNode = graph.get(tx.from)!;
    const existing = fromNode.get(tx.to) || 0;
    fromNode.set(tx.to, existing + tx.amount);
  });

  const nodes = Array.from(graph.keys());

  for (const k of nodes) {
    for (const i of nodes) {
      if (!graph.get(i)?.has(k)) continue;

      for (const j of nodes) {
        const directDebt = graph.get(i)?.get(j) || 0;
        const throughK = Math.min(
          graph.get(i)?.get(k) || 0,
          graph.get(k)?.get(j) || 0
        );

        if (throughK > 0) {
          const iMap = graph.get(i)!;

          if (directDebt > 0) {
            if (throughK >= directDebt) {
              iMap.delete(j);
            } else {
              iMap.set(j, directDebt - throughK);
            }
          }
        }
      }
    }
  }

  const optimizedTransactions: Edge[] = [];

  for (const [from, edges] of graph.entries()) {
    for (const [to, amount] of edges.entries()) {
      if (amount > 0.01) {
        optimizedTransactions.push({
          from,
          to,
          amount: Number(amount.toFixed(2)),
        });
      }
    }
  }

  return optimizedTransactions;
}
