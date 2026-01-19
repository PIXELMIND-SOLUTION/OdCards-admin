import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { FaTrash, FaEye, FaSearch } from "react-icons/fa";

const Customers = ({ darkMode }) => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchField, setSearchField] = useState("name");
  const [searchText, setSearchText] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  /* ================= FETCH USERS ================= */
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/users/getallusers"
      );
      setCustomers(res.data.users || []);
      setFiltered(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const result = customers.filter((u) =>
      (u[searchField] || "")
        .toString()
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
    setFiltered(result);
  }, [searchText, searchField, customers]);

  /* ================= VIEW USER ================= */
  const viewUser = async (id) => {
    try {
      const userRes = await axios.get(
        `http://31.97.206.144:9124/api/users/user/${id}`
      );
      setSelectedUser(userRes.data.user);

      const addressRes = await axios.get(
        `http://31.97.206.144:9124/api/addresses/${id}`
      );
      setAddresses(addressRes.data || []);
      setShowModal(true);
    } catch {
      Swal.fire("Error", "Failed to load user details", "error");
    }
  };

  /* ================= DELETE USER ================= */
  const deleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete user?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `http://31.97.206.144:9124/api/users/deleteuser/${id}`
      );
      Swal.fire("Deleted!", "User removed successfully", "success");
      fetchCustomers();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  /* ================= EXPORT EXCEL ================= */
  const exportExcel = () => {
    const data = filtered.map((u, i) => ({
      SNo: i + 1,
      ID: u._id,
      Name: u.name,
      Email: u.email,
      Mobile: u.mobile,
      Location: u.location,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customers.xlsx");
  };

  return (
    <div
      className={`p-6 space-y-6 min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Export Excel
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col md:flex-row gap-3">
        <select
          className={`border px-3 py-2 rounded-lg ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300"
          }`}
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="mobile">Mobile</option>
          <option value="location">Location</option>
        </select>

        <div className="relative flex-1">
          <FaSearch
            className={`absolute left-3 top-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300"
            }`}
            placeholder={`Search ${searchField}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead
              className={
                darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }
            >
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u._id}
                  className={`border-t ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-800"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.mobile}</td>
                  <td className="p-3">{u.location}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => viewUser(u._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-xl rounded-xl p-6 space-y-4 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-bold">User Details</h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Mobile:</strong> {selectedUser.mobile}</p>
              <p><strong>Location:</strong> {selectedUser.location}</p>
            </div>

            <div>
              <h3 className="font-semibold mt-3 mb-2">Addresses</h3>
              {addresses.length === 0 ? (
                <p className="text-gray-400 text-sm">No addresses</p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <div
                      key={a._id}
                      className={`border p-3 rounded-lg text-sm ${
                        darkMode
                          ? "border-gray-700 bg-gray-900"
                          : "bg-gray-50"
                      }`}
                    >
                      {a.addressline1}, {a.city}, {a.state} - {a.pincode}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
