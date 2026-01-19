import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaEye,
  FaMoon,
  FaSun,
  FaSearch,
  FaImage,
} from "react-icons/fa";

const API_URL = "http://31.97.206.144:9124/api/users/getall-orders";

const PAGE_SIZES = [5, 10, 20];

export const AllOrders = ( {darkMode} ) => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
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

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  /* ================= HELPERS ================= */
  const badge = (status) => {
    const map = {
      pending: "bg-yellow-500",
      Pending: "bg-yellow-500",
      paid: "bg-green-600",
      completed: "bg-green-600",
      failed: "bg-red-600",
    };
    return `${map[status] || "bg-gray-500"} text-white px-2 py-1 rounded text-xs`;
  };

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 text-white rounded-lg border dark:bg-gray-800 dark:border-gray-700"
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
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-center py-10">Loading orders...</p>
      ) : paginatedOrders.length === 0 ? (
        <p className="text-center text-gray-400">No orders found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table
            className={`min-w-full text-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Total</th>
                <th className="p-3">Order</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-center">View</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o) => (
                <tr
                  key={o._id}
                  className={`border-t ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:cursor-pointer hover:text-white`}
                >
                  <td className="p-3 font-mono">{o.orderId}</td>
                  <td className="p-3">
                    <p className="font-semibold">{o.userId?.name}</p>
                    <p className="text-xs text-gray-400">
                      {o.userId?.email}
                    </p>
                  </td>
                  <td className="p-3">{o.productName || "-"}</td>
                  <td className="p-3">{o.quantity || "-"}</td>
                  <td className="p-3 font-semibold">
                    ₹{o.totalPrice || "-"}
                  </td>
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
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 text-white rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-white rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "text-white bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 text-white rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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

            <h2 className="text-xl font-bold mb-3">
              Order #{selectedOrder.orderId}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p><strong>Name:</strong> {selectedOrder.userId?.name}</p>
              <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
              <p><strong>Mobile:</strong> {selectedOrder.userId?.mobile}</p>
              <p><strong>Location:</strong> {selectedOrder.userId?.location}</p>

              <p><strong>Product:</strong> {selectedOrder.productName}</p>
              <p><strong>Category:</strong> {selectedOrder.productCategory}</p>
              <p><strong>Printing:</strong> {selectedOrder.printingType}</p>
              <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>

              <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
            </div>

            {(selectedOrder.images?.length > 0 ||
              selectedOrder.designFile) && (
              <div className="mt-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FaImage /> Files
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedOrder.designFile && (
                    <img
                      src={`http://31.97.206.144:9124${selectedOrder.designFile}`}
                      className="h-32 w-full object-cover rounded"
                    />
                  )}
                  {selectedOrder.images?.map((img, i) => (
                    <img
                      key={i}
                      src={`http://31.97.206.144:9124${img}`}
                      className="h-32 w-full object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
