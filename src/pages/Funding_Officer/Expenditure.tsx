
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Filter,
  X,
  MoreHorizontal,
  CheckCircle2,
  Receipt,
  Wallet,
  ShieldCheck,
} from "lucide-react";

type Expense = {
  id: string;
  amount: number;
  description: string;
  recipient: string;
  invoice: string;
  date: string;
  verification: "Verified" | "Pending Review" | "Rejected";
  paymentStatus: "Paid" | "On Hold" | "Pending";
  type: string;
};

const initialExpenses: Expense[] = [
  {
    id: "EXP-9021",
    amount: 24840,
    description: "Shelter kits - Batch 18",
    recipient: "CareLink Shelter Network",
    invoice: "INV-4821",
    date: "21 Jun",
    verification: "Verified",
    paymentStatus: "Paid",
    type: "Shelter",
  },
  {
    id: "EXP-9014",
    amount: 18240,
    description: "Emergency vehicle fuel",
    recipient: "Logistics Unit",
    invoice: "INV-4814",
    date: "21 Jun",
    verification: "Verified",
    paymentStatus: "Paid",
    type: "Transport",
  },
  {
    id: "EXP-9008",
    amount: 42600,
    description: "Medical supplies",
    recipient: "Health Response Unit",
    invoice: "INV-4808",
    date: "20 Jun",
    verification: "Pending Review",
    paymentStatus: "On Hold",
    type: "Medical",
  },
  {
    id: "EXP-8996",
    amount: 12480,
    description: "Water distribution",
    recipient: "Municipal Water Team",
    invoice: "INV-4796",
    date: "20 Jun",
    verification: "Verified",
    paymentStatus: "Paid",
    type: "Water",
  },
];

const currency = (amount: number) =>
  "$" + amount.toLocaleString("en-US");

export default function Expenditure() {
  const [expenses, setExpenses] =
    useState<Expense[]>(initialExpenses);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");
  const [statusFilter, setStatusFilter] =
    useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiClient.get<any>("/expenditures").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setExpenses(
          items.map((ex: any) => ({
            id: ex.id || ex.reference || "EXP-9000",
            amount: Number(ex.amount ?? 0),
            description: ex.description || "Expenditure",
            recipient: ex.recipient || "CareLink",
            invoice: ex.invoice || ex.invoiceNumber || "INV-4800",
            date: ex.date || "Today",
            verification: (ex.verification as Expense["verification"]) || "Verified",
            paymentStatus: (ex.paymentStatus as Expense["paymentStatus"]) || "Paid",
            type: ex.type || ex.category || "Shelter",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    recipient: "",
    invoice: "",
    date: new Date().toISOString().slice(0, 10),
    type: "Shelter",
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // SEARCH AND FILTER

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchMatch = [
        expense.id,
        expense.description,
        expense.recipient,
        expense.invoice,
        expense.amount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All types" ||
        expense.type === typeFilter;

      const verificationMatch =
        verificationFilter === "All verification states" ||
        expense.verification === verificationFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        expense.paymentStatus === statusFilter;

      return (
        searchMatch &&
        typeMatch &&
        verificationMatch &&
        statusMatch
      );
    });
  }, [
    expenses,
    search,
    typeFilter,
    verificationFilter,
    statusFilter,
  ]);

  // CREATE EXPENSE

  const handleCreateExpense = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const amount = Number(newExpense.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !newExpense.description.trim() ||
      !newExpense.recipient.trim() ||
      !newExpense.invoice.trim()
    ) {
      notify("Please enter valid expense details.");
      return;
    }

    apiClient.post("/expenditures", {
      amount,
      description: newExpense.description,
      recipient: newExpense.recipient,
      invoice: newExpense.invoice,
      date: newExpense.date,
      type: newExpense.type,
    }).catch(() => {});

    const expense: Expense = {
      id: `EXP-${Math.floor(9000 + Math.random() * 999)}`,
      amount,
      description: newExpense.description,
      recipient: newExpense.recipient,
      invoice: newExpense.invoice,
      date: new Date(newExpense.date).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
        }
      ),
      verification: "Pending Review",
      paymentStatus: "On Hold",
      type: newExpense.type,
    };

    setExpenses((previous) => [expense, ...previous]);

    setNewExpense({
      amount: "",
      description: "",
      recipient: "",
      invoice: "",
      date: new Date().toISOString().slice(0, 10),
      type: "Shelter",
    });

    setShowModal(false);
    clearFilters();
    notify("Expense recorded successfully.");
  };

  // VERIFY EXPENSE

  const verifyExpense = (id: string) => {
    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              verification: "Verified",
              paymentStatus: "Pending",
            }
          : expense
      )
    );

    setActiveMenu(null);
    setSelectedExpense(null);
    notify("Expense verified successfully.");
  };

  // REJECT EXPENSE

  const rejectExpense = (id: string) => {
    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              verification: "Rejected",
              paymentStatus: "On Hold",
            }
          : expense
      )
    );

    setActiveMenu(null);
    setSelectedExpense(null);
    notify("Expense rejected.");
  };

  // UPDATE PAYMENT STATUS

  const markAsPaid = (id: string) => {
    const expense = expenses.find((item) => item.id === id);

    if (!expense || expense.verification !== "Verified") {
      notify("Only verified expenses can be paid.");
      return;
    }

    setExpenses((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, paymentStatus: "Paid" }
          : item
      )
    );

    setActiveMenu(null);
    setSelectedExpense(null);
    notify("Payment marked as paid.");
  };

  // SELECT ROWS

  const toggleRow = (id: string) => {
    setSelectedRows((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAll = () => {
    const allSelected =
      filteredExpenses.length > 0 &&
      filteredExpenses.every((item) =>
        selectedRows.includes(item.id)
      );

    if (allSelected) {
      setSelectedRows((previous) =>
        previous.filter(
          (id) =>
            !filteredExpenses.some(
              (expense) => expense.id === id
            )
        )
      );
    } else {
      setSelectedRows((previous) => [
        ...new Set([
          ...previous,
          ...filteredExpenses.map((item) => item.id),
        ]),
      ]);
    }
  };

  // BULK VERIFY

  const bulkVerify = () => {
    if (selectedRows.length === 0) {
      notify("Please select expenses first.");
      return;
    }

    setExpenses((previous) =>
      previous.map((expense) =>
        selectedRows.includes(expense.id) &&
        expense.verification === "Pending Review"
          ? {
              ...expense,
              verification: "Verified",
              paymentStatus: "Pending",
            }
          : expense
      )
    );

    setSelectedRows([]);
    notify("Selected expenses have been reviewed.");
  };

  // EXPORT CSV

  const exportCSV = () => {
    const headers = [
      "Expense ID",
      "Amount",
      "Description",
      "Recipient",
      "Invoice",
      "Date",
      "Verification",
      "Payment Status",
      "Type",
    ];

    const rows = filteredExpenses.map((expense) => [
      expense.id,
      expense.amount,
      expense.description,
      expense.recipient,
      expense.invoice,
      expense.date,
      expense.verification,
      expense.paymentStatus,
      expense.type,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "carelink-expenditure.csv";
    link.click();

    URL.revokeObjectURL(url);
    notify("Expenditure report exported.");
  };

  // CLEAR FILTERS

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setPage(1);
  };

  // STATUS COLORS

  const verificationStyle = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-[#e5f6f0] text-[#078c70]";
      case "Pending Review":
        return "bg-[#fff3dd] text-[#b7791f]";
      case "Rejected":
        return "bg-[#fde9eb] text-[#d83e4b]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const paymentStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-[#e5f6f0] text-[#078c70]";
      case "On Hold":
        return "bg-[#fff3dd] text-[#b7791f]";
      default:
        return "bg-[#edf2f5] text-[#55738a]";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">


      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">Expenditure</span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Expenditure
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Record and verify humanitarian expenditure against approved allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={exportCSV}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] flex items-center gap-2 hover:bg-[#f5fafc]"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="h-[40px] px-4 bg-[#23749e] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={16} />
              Record expense
            </button>

          </div>
        </div>

        {/* SEARCH AND FILTERS */}

        <section className="flex flex-col lg:flex-row gap-2.5 mb-4">

          <div className="relative flex-1">

            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search expense, invoice, or recipient..."
              className="w-full h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-10 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#35b995]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">

            <FilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              options={[
                "All types",
                "Shelter",
                "Transport",
                "Medical",
                "Water",
              ]}
            />

            <FilterSelect
              value={verificationFilter}
              onChange={(value) => {
                setVerificationFilter(value);
                setPage(1);
              }}
              options={[
                "All verification states",
                "Verified",
                "Pending Review",
                "Rejected",
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                "All statuses",
                "Paid",
                "On Hold",
                "Pending",
              ]}
            />

            <FilterSelect
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                "Date range",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
              ]}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#f5fafc]"
            >
              <Filter size={14} />
              More filters
            </button>
          </div>
        </section>

        {/* ADDITIONAL FILTERS */}

        {showFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4">

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Recipient
              </label>
              <input
                placeholder="Search recipient"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Minimum amount
              </label>
              <input
                type="number"
                placeholder="Minimum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Maximum amount
              </label>
              <input
                type="number"
                placeholder="Maximum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <button
              onClick={() => {
                setShowFilters(false);
                notify("Additional filters applied.");
              }}
              className="h-[35px] px-4 bg-[#23749e] text-white rounded-lg text-sm"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="h-[35px] px-3 text-[#23749e] text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* EXPENDITURE TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-visible">

          {/* TABLE HEADER */}

          <div className="px-4 py-4 flex items-center justify-between border-b border-[#d7e4e9]">

            <div>
              <h2 className="text-base sm:text-lg font-semibold">
                Expenditure
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredExpenses.length} demonstration records
              </p>
            </div>

            <button
              onClick={bulkVerify}
              className="h-[40px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e] hover:bg-[#f5fafc]"
            >
              Bulk actions
              {selectedRows.length > 0 &&
                ` (${selectedRows.length})`}
            </button>
          </div>

          {/* TABLE BODY */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead>
                <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">

                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredExpenses.length > 0 &&
                        filteredExpenses.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
                      onChange={toggleAll}
                      className="accent-[#23749e]"
                    />
                  </th>

                  {[
                    "Expense ID",
                    "Amount",
                    "Description",
                    "Recipient",
                    "Invoice",
                    "Date",
                    "Verification",
                    "Payment Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>

                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-[#e3ebef] hover:bg-[#f8fbfc] transition-colors"
                  >

                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(expense.id)}
                        onChange={() => toggleRow(expense.id)}
                        className="accent-[#23749e]"
                      />
                    </td>

                    <td className="px-3 py-4 text-sm font-semibold whitespace-nowrap">
                      {expense.id}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {currency(expense.amount)}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {expense.description}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {expense.recipient}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {expense.invoice}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {expense.date}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${verificationStyle(
                          expense.verification
                        )}`}
                      >
                        {expense.verification}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${paymentStyle(
                          expense.paymentStatus
                        )}`}
                      >
                        {expense.paymentStatus}
                      </span>
                    </td>

                    {/* THREE DOT ACTION MENU */}

                    <td className="px-3 py-4 relative">

                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === expense.id
                              ? null
                              : expense.id
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-[#23749e]"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenu === expense.id && (
                        <div className="absolute right-8 top-8 z-30 w-48 bg-white border border-[#d5e3e9] rounded-lg shadow-lg py-1">

                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f6f8]"
                          >
                            View expense details
                          </button>

                          {expense.verification === "Pending Review" && (
                            <>
                              <button
                                onClick={() =>
                                  verifyExpense(expense.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-[#159b79] hover:bg-[#f1f6f8]"
                              >
                                Verify expense
                              </button>

                              <button
                                onClick={() =>
                                  rejectExpense(expense.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#f1f6f8]"
                              >
                                Reject expense
                              </button>
                            </>
                          )}

                          {expense.verification === "Verified" &&
                            expense.paymentStatus !== "Paid" && (
                              <button
                                onClick={() =>
                                  markAsPaid(expense.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-[#23749e] hover:bg-[#f1f6f8]"
                              >
                                Mark as paid
                              </button>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-14">

                      <Receipt
                        size={27}
                        className="mx-auto text-slate-300 mb-3"
                      />

                      <p className="text-sm font-medium">
                        No expenditure records found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>

                      <button
                        onClick={clearFilters}
                        className="text-[#23749e] text-sm mt-3"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-xs text-slate-400">
              Showing 1–{filteredExpenses.length} of{" "}
              {filteredExpenses.length === expenses.length
                ? "1,842"
                : filteredExpenses.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                className="h-[34px] px-4 border border-[#d5e3e9] rounded-lg text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {[1, 2, 3].map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`w-[34px] h-[34px] border rounded-lg text-sm ${
                    page === number
                      ? "bg-[#23749e] text-white border-[#23749e]"
                      : "bg-white border-[#d5e3e9]"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() =>
                  setPage((previous) => previous + 1)
                }
                className="h-[34px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e]"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* RECORD EXPENSE MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-xl w-full max-w-[470px] max-h-[90vh] overflow-y-auto p-5"
          >

            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Record expense
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Enter the expenditure and invoice details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3">

              <FormField label="Expense amount (USD)">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense description">
                <input
                  required
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Emergency shelter kits"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense type">
                <select
                  value={newExpense.type}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      type: e.target.value,
                    })
                  }
                  className="expenditure-input"
                >
                  <option value="Shelter">Shelter</option>
                  <option value="Transport">Transport</option>
                  <option value="Medical">Medical</option>
                  <option value="Water">Water</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Recipient">
                <input
                  required
                  value={newExpense.recipient}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      recipient: e.target.value,
                    })
                  }
                  placeholder="Enter recipient organisation"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Invoice number">
                <input
                  required
                  value={newExpense.invoice}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      invoice: e.target.value,
                    })
                  }
                  placeholder="e.g. INV-4822"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense date">
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      date: e.target.value,
                    })
                  }
                  className="expenditure-input"
                />
              </FormField>

              <div className="bg-[#eef5f7] rounded-lg p-3 flex items-start gap-2">

                <ShieldCheck
                  size={16}
                  className="text-[#23749e] shrink-0"
                />

                <p className="text-xs text-slate-600">
                  Newly recorded expenses will be submitted
                  with <strong>Pending Review</strong> status.
                  Payment will remain on hold until verification.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-sm font-semibold hover:bg-[#175c80]"
              >
                Save expense
              </button>
            </div>

          </form>
        </div>
      )}

      {/* EXPENSE DETAILS MODAL */}

      {selectedExpense && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] p-5">

            <div className="flex items-start justify-between mb-5">

              <div>
                <p className="text-xs text-[#23749e] font-semibold">
                  {selectedExpense.id}
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mt-1">
                  Expense details
                </h2>
              </div>

              <button
                onClick={() => setSelectedExpense(null)}
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-[#eef5f7] rounded-lg p-4 mb-4">

              <p className="text-xs text-slate-500">
                Expense amount
              </p>

              <h3 className="text-[25px] font-bold mt-1">
                {currency(selectedExpense.amount)}
              </h3>
            </div>

            <div className="space-y-3">

              {[
                ["Description", selectedExpense.description],
                ["Recipient", selectedExpense.recipient],
                ["Invoice", selectedExpense.invoice],
                ["Date", selectedExpense.date],
                ["Type", selectedExpense.type],
                ["Verification", selectedExpense.verification],
                ["Payment status", selectedExpense.paymentStatus],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-slate-100 pb-2"
                >
                  <span className="text-xs text-slate-400">
                    {label}
                  </span>

                  <span className="text-xs font-medium text-right">
                    {value}
                  </span>
                </div>
              ))}

            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">

              {selectedExpense.verification === "Pending Review" && (
                <>
                  <button
                    onClick={() =>
                      rejectExpense(selectedExpense.id)
                    }
                    className="px-3 py-2 bg-[#fde9e9] text-red-600 rounded-lg text-sm"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      verifyExpense(selectedExpense.id)
                    }
                    className="px-3 py-2 bg-[#e4f6f0] text-[#159b79] rounded-lg text-sm"
                  >
                    Verify expense
                  </button>
                </>
              )}

              {selectedExpense.verification === "Verified" &&
                selectedExpense.paymentStatus !== "Paid" && (
                  <button
                    onClick={() =>
                      markAsPaid(selectedExpense.id)
                    }
                    className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-sm"
                  >
                    Mark as paid
                  </button>
                )}

              <button
                onClick={() => setSelectedExpense(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-[#123e60] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">

          <CheckCircle2 size={15} />

          {toast}

          <button onClick={() => setToast("")}>
            <X size={13} />
          </button>
        </div>
      )}

    </div>
  );
}

// ========================================
// FILTER SELECT
// ========================================

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-0">

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full lg:w-[150px] h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-sm sm:text-[15px] outline-none focus:border-[#35b995] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />

    </div>
  );
}

// ========================================
// FORM FIELD
// ========================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="block text-xs font-medium mb-1.5">
        {label}
      </span>

      {children}

    </label>
  );
}
