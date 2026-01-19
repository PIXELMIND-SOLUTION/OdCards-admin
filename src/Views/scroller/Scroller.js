import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const Scroller = ({ darkMode }) => {
  const [marquees, setMarquees] = useState([]);
  const [text, setText] = useState("");
  const [icon, setIcon] = useState("fa-envelope");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchMarquees = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/marquees/getall"
      );
      setMarquees(res.data.marquees || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarquees();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = { text, icon };
    setLoading(true);

    try {
      if (editId) {
        await axios.put(
          `http://31.97.206.144:9124/api/marquees/update/${editId}`,
          payload
        );
        Swal.fire("Updated", "Marquee updated successfully", "success");
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/marquees/add",
          payload
        );
        Swal.fire("Created", "Marquee added successfully", "success");
      }

      resetForm();
      fetchMarquees();
    } catch {
      Swal.fire("Error", "Failed to save marquee", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  const handleEdit = (item) => {
    setText(item.text);
    setIcon(item.icon);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!ok.isConfirmed) return;

    await axios.delete(
      `http://31.97.206.144:9124/api/marquees/delete/${id}`
    );
    Swal.fire("Deleted", "Marquee removed", "success");
    fetchMarquees();
  };

  const resetForm = () => {
    setText("");
    setIcon("fa-envelope");
    setEditId(null);
  };

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        Scroller (Marquee) Management
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className={`grid md:grid-cols-3 gap-4 p-5 rounded-xl shadow mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <input
          type="text"
          placeholder="Enter marquee text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="p-3 rounded border text-white dark:bg-gray-900 dark:border-gray-700"
        />

        <input
          type="text"
          placeholder="Icon class (e.g. fa-envelope)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="p-3 rounded border text-white dark:bg-gray-900 dark:border-gray-700"
        />

        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded px-4 py-3 hover:bg-indigo-700"
        >
          <FaPlus />
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* TABLE */}
      <div
        className={`rounded-xl shadow overflow-x-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="w-full text-sm">
          <thead
            className={`${
              darkMode
                ? "bg-gray-700 text-gray-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Text</th>
              <th className="p-3 text-left">Icon</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {marquees.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-400">
                  No marquee items found
                </td>
              </tr>
            ) : (
              marquees.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.text}</td>
                  <td className="p-3 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon}`} />
                    <span className="text-xs text-gray-400">
                      {item.icon}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-600"
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
    </div>
  );
};

export default Scroller;
