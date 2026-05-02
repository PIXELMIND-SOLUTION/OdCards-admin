import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaEye,
  FaSearch,
  FaTrash,
  FaDownload,
  FaSave,
} from "react-icons/fa";

const API_BASE = "http://31.97.228.17:9124/api/users";
const PAGE_SIZES = [5, 10, 20, 50];

const badge = (status) => {
  const map = {
    pending: "bg-yellow-500",
    completed: "bg-green-600",
    paid: "bg-green-600",
    failed: "bg-red-600",
  };
  return `${map[status] || "bg-gray-500"} text-white px-2 py-1 rounded-full text-xs`;
};

const AllOrders = ({ darkMode }) => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState(null);

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/getall-orders`);
      setOrders(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const s = search.toLowerCase();
    const result = orders.filter(
      (o) =>
        o.orderId?.toLowerCase().includes(s) ||
        o.userId?.name?.toLowerCase().includes(s) ||
        o.userId?.email?.toLowerCase().includes(s)
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, orders]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Product",
      "Quantity",
      "Total",
      "Order Status",
      "Payment Status",
    ];

    const rows = filtered.map((o) => [
      o.orderId,
      o.userId?.name,
      o.userId?.email,
      o.productName,
      o.quantity,
      o.totalPrice,
      o.orderStatus,
      o.paymentStatus,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "orders.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= UPDATE ================= */
  const updateOrder = async () => {
    try {
      await axios.put(
        `${API_BASE}/update-order/${selectedOrder._id}`,
        {
          orderStatus: selectedOrder.orderStatus,
          paymentStatus: selectedOrder.paymentStatus,
        }
      );
      fetchOrders();
      setSelectedOrder(null);
    } catch {
      alert("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axios.delete(`${API_BASE}/delete/${id}`);
      fetchOrders();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">All Orders</h1>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 rounded-lg text-white border dark:bg-gray-800 dark:border-gray-700"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border text-white dark:bg-gray-800 dark:border-gray-700"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s}>{s} / page</option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table
          className={`min-w-full text-sm ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th className="p-3 text-center">S NO</th>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Total</th>
              <th className="p-3">Order</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  Loading orders...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-6 text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o, index) => (
                <tr
                  key={o._id}
                  className={`border-t ${
                    darkMode ? "border-gray-700 text-white" : "border-gray-200"
                  } hover:bg-indigo-50 hover:text-white dark:hover:bg-gray-700`}
                >
                  <td className="p-3 text-center font-semibold">{(currentPage - 1)*pageSize + index + 1}</td>
                  <td className="p-3 font-mono">{o.orderId}</td>
                  <td className="p-3">
                    <p className="font-semibold">{o.userId?.name}</p>
                    <p className="text-xs text-gray-400">
                      {o.userId?.email}
                    </p>
                  </td>
                  <td className="p-3">{o.productName}</td>
                  <td className="p-3">{o.quantity}</td>
                  <td className="p-3 font-semibold">₹{o.totalPrice}</td>
                  <td className="p-3">
                    <span className={badge(o.orderStatus)}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={badge(o.paymentStatus)}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => deleteOrder(o._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={`max-w-3xl w-full rounded-xl p-6 relative ${
              darkMode ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-red-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder.orderId}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p><strong>Name:</strong> {selectedOrder.userId?.name}</p>
              <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
              <p><strong>Product:</strong> {selectedOrder.productName}</p>
              <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) =>
                  setSelectedOrder({
                    ...selectedOrder,
                    orderStatus: e.target.value,
                  })
                }
                className="p-2 rounded-lg border text-white dark:bg-gray-800"
              >
                <option>pending</option>
                <option>completed</option>
                <option>failed</option>
              </select>

              <select
                value={selectedOrder.paymentStatus}
                onChange={(e) =>
                  setSelectedOrder({
                    ...selectedOrder,
                    paymentStatus: e.target.value,
                  })
                }
                className="p-2 rounded-lg border text-white dark:bg-gray-800"
              >
                <option>pending</option>
                <option>paid</option>
                <option>failed</option>
              </select>
            </div>

            <button
              onClick={updateOrder}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              <FaSave /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
