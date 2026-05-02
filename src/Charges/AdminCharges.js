import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Edit, Trash2, Plus, X, CheckCircle } from "lucide-react";

const API_BASE = "http://31.97.228.17:9124/api/admin";

const AdminCharges = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // view | edit | add
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [form, setForm] = useState({
    deliveryPrice: "",
    taxPrice: "",
    isActive: true,
  });

  /* ================= FETCH ================= */
  const fetchCharges = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/charges`);
      setCharges(res.data.data);
    } catch {
      alert("Failed to fetch charges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  /* ================= MODALS ================= */
  const openAdd = () => {
    setForm({ deliveryPrice: "", taxPrice: "", isActive: true });
    setModalType("add");
  };

  const openView = (charge) => {
    setSelectedCharge(charge);
    setModalType("view");
  };

  const openEdit = (charge) => {
    setSelectedCharge(charge);
    setForm({
      deliveryPrice: charge.deliveryPrice,
      taxPrice: charge.taxPrice,
      isActive: charge.isActive,
    });
    setModalType("edit");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCharge(null);
  };

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    try {
      await axios.post(`${API_BASE}/charges`, {
        deliveryPrice: Number(form.deliveryPrice),
        taxPrice: Number(form.taxPrice),
      });
      fetchCharges();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/charges/${selectedCharge._id}`, {
        deliveryPrice: Number(form.deliveryPrice),
        taxPrice: Number(form.taxPrice),
        isActive: form.isActive,
      });
      fetchCharges();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charge?")) return;
    try {
      await axios.delete(`${API_BASE}/charges/${id}`);
      fetchCharges();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Charges</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage delivery & tax charges (only one active)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow hover:scale-105 transition"
        >
          <Plus size={18} />
          Add Charge
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading charges...
        </div>
      ) : charges.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No charges found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {charges.map((charge) => (
            <div
              key={charge._id}
              className={`relative rounded-2xl p-6 backdrop-blur bg-white/80 border transition shadow-md hover:shadow-xl ${
                charge.isActive
                  ? "border-green-400 ring-1 ring-green-300"
                  : "border-gray-200"
              }`}
            >
              {/* ACTIVE BADGE */}
              {charge.isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-green-700 text-xs font-semibold bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle size={14} /> Active
                </div>
              )}

              {/* CONTENT */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Delivery Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹ {charge.deliveryPrice}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tax</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {charge.taxPrice} %
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  Updated: {new Date(charge.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => openView(charge)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => openEdit(charge)}
                  className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(charge._id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
              onClick={closeModal}
            >
              <X />
            </button>

            {/* VIEW */}
            {modalType === "view" && (
              <>
                <h3 className="text-xl font-bold mb-4">Charge Details</h3>
                <div className="space-y-3">
                  <p><strong>Delivery:</strong> ₹ {selectedCharge.deliveryPrice}</p>
                  <p><strong>Tax:</strong> {selectedCharge.taxPrice} %</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedCharge.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </>
            )}

            {/* ADD / EDIT */}
            {(modalType === "add" || modalType === "edit") && (
              <>
                <h3 className="text-xl font-bold mb-4">
                  {modalType === "add" ? "Add Charge" : "Edit Charge"}
                </h3>

                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Delivery Price"
                    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.deliveryPrice}
                    onChange={(e) =>
                      setForm({ ...form, deliveryPrice: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Tax (%)"
                    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.taxPrice}
                    onChange={(e) =>
                      setForm({ ...form, taxPrice: e.target.value })
                    }
                  />

                  {modalType === "edit" && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm({ ...form, isActive: e.target.checked })
                        }
                      />
                      Set as Active
                    </label>
                  )}

                  <button
                    onClick={modalType === "add" ? handleCreate : handleUpdate}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl hover:opacity-90 transition"
                  >
                    {modalType === "add" ? "Create Charge" : "Update Charge"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCharges;
