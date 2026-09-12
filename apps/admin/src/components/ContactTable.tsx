import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Mail, Download, Filter } from "lucide-react";
import { Contact } from "../types";

interface ContactTableProps {
  contacts: Contact[];
  onViewContact: (contact: Contact) => void;
  onUpdateStatus: (id: string, status: Contact["status"]) => void;
  loading?: boolean;
}

const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 border-b border-gray-100"
      >
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    ))}
  </div>
);

export default function ContactTable({
  contacts,
  onViewContact,
  onUpdateStatus,
  loading = false,
}: ContactTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Contact["status"] | "All">(
    "All"
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const statusColors: Record<Contact["status"], string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Converted: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  };

  // Normalize contacts to ensure fields exist
  const normalizedContacts = contacts.map((c) => ({
    ...c,
    fullName: c.fullName || "",
    company: c.company || "",
    service: c.service || "",
    status: c.status || "New",
    createdAt: c.createdAt || c.createdAt || new Date().toISOString(),
  }));

  const filteredContacts = normalizedContacts.filter((contact) => {
    const matchesSearch =
      (contact.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Company",
      "Phone",
      "Service",
      "Status",
      "Date",
    ];
    const rows = filteredContacts.map((c) => [
      c.fullName,
      c.email,
      c.company,
      c.phone,
      c.service,
      c.status,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#0A2540]">
              Contact Inquiries
            </h3>
            <p className="text-sm text-[#64748B] mt-1">
              {filteredContacts.length} total contacts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <motion.input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Filter */}
            <div className="relative">
              <motion.button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter size={18} className="text-[#64748B]" />
              </motion.button>

              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {[
                      "All",
                      "New",
                      "Contacted",
                      "In Progress",
                      "Converted",
                      "Closed",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status as Contact["status"] | "All");
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors ${
                          statusFilter === status
                            ? "bg-[#1E40AF]/10 text-[#1E40AF] font-medium"
                            : "text-[#64748B]"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export */}
            <motion.button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#14B8A6]/90 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : (
          <table className="w-full">
            {/* Table Headers - NO HIDING FOR TESTING */}
            <thead className="bg-[#F8FAFC] border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    onClick={() => onViewContact(contact)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1E40AF] to-[#14B8A6] flex items-center justify-center text-white font-semibold">
                          {(contact.fullName || "").charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#0A2540]">
                            {contact.fullName}
                          </p>
                          <p className="text-sm text-[#64748B]">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">
                      {contact.company || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">
                      {contact.service || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(
                            contact.id,
                            e.target.value as Contact["status"]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border-none outline-none ${
                          statusColors[contact.status]
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] hidden xl:table-cell">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewContact(contact);
                          }}
                          className="p-2 hover:bg-[#1E40AF]/10 rounded-lg transition-colors text-[#1E40AF]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye size={16} />
                        </motion.button>
                        <motion.a
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-[#14B8A6]/10 rounded-lg transition-colors text-[#14B8A6]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Mail size={16} />
                        </motion.a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}

        {!loading && filteredContacts.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-[#64748B]">No contacts found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
