import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaImages,
  FaSpinner,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const Banners = ({ darkMode }) => {
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const [form, setForm] = useState({
    title: "",
    name: "",
    content: "",
    images: [],
    previews: [],
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/banners/getallbanners"
      );
      setBanners(res.data?.banners || []);
    } catch {
      Swal.fire("Error", "Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const res = await axios.get(
        `http://31.97.206.144:9124/api/banners/banner/${id}`
      );
      setSelectedBanner(res.data.banner);
      setShowModal(true);
    } catch {
      Swal.fire("Error", "Failed to fetch details", "error");
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setForm({
      ...form,
      images: files,
      previews: files.map((f) => URL.createObjectURL(f)),
    });
    setUploading(true);
    setTimeout(() => setUploading(false), 800);
  };

  const resetForm = () => {
    form.previews.forEach((p) => URL.revokeObjectURL(p));
    setForm({ title: "", name: "", content: "", images: [], previews: [] });
    setEditingId(null);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("name", form.name);
    data.append("content", form.content);
    form.images.forEach((img) => data.append("images", img));

    try {
      if (editingId) {
        await axios.put(
          `http://31.97.206.144:9124/api/banners/updatebanner/${editingId}`,
          data
        );
        Swal.fire("Updated", "Banner updated", "success");
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/banners/create",
          data
        );
        Swal.fire("Created", "Banner created", "success");
      }
      resetForm();
      setShowForm(false);
      fetchBanners();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const editBanner = (b) => {
    setForm({
      title: b.title,
      name: b.name,
      content: b.content,
      images: [],
      previews: b.images.map(
        (i) => `http://31.97.206.144:9124/uploads/banners/${i}`
      ),
    });
    setEditingId(b._id);
    setShowForm(true);
  };

  const deleteBanner = async (id) => {
    const ok = await Swal.fire({
      title: "Delete banner?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;

    await axios.delete(
      `http://31.97.206.144:9124/api/banners/deletebanner/${id}`
    );
    fetchBanners();
    Swal.fire("Deleted", "Banner removed", "success");
  };

  /* ================= UI ================= */
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FaPlus /> {showForm ? "Close Form" : "Add Banner"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={submitForm}
          className={`p-6 rounded-2xl shadow mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Banner Title"
              required
              className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700"
            />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Banner Name"
              required
              className="p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700"
            />
          </div>

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Banner Description"
            className="w-full p-3 rounded-lg border mt-4 dark:bg-gray-900 dark:border-gray-700"
            rows={4}
            required
          />

          <div className="mt-4">
            <label className="flex items-center gap-2 font-semibold mb-2">
              <FaImages /> Banner Images
            </label>
            <input type="file" multiple onChange={handleFiles} />
            {uploading && (
              <p className="text-indigo-500 mt-2">
                <FaSpinner className="inline animate-spin mr-2" />
                Processing images...
              </p>
            )}
          </div>

          {form.previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {form.previews.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  className="h-28 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              {loading ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
      )}

      {/* LIST */}
      {loading ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-3xl text-indigo-600" />
        </div>
      ) : banners.length === 0 ? (
        <p className="text-center text-gray-400">No banners found</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b._id}
              className={`rounded-2xl shadow overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <img
                src={`http://31.97.206.144:9124/uploads/banners/${b.images[0]}`}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{b.title}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {b.content}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <FaImages /> {b.images.length}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => fetchDetails(b._id)}>
                      <FaEye />
                    </button>
                    <button onClick={() => editBanner(b)}>
                      <FaEdit className="text-yellow-500" />
                    </button>
                    <button onClick={() => deleteBanner(b._id)}>
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedBanner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`rounded-2xl max-w-3xl w-full p-6 relative ${
              darkMode ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-red-500"
            >
              <FaTimes />
            </button>

            <h2 className="text-xl font-bold mb-2">
              {selectedBanner.title}
            </h2>
            <p className="text-gray-400">{selectedBanner.content}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {selectedBanner.images.map((img, i) => (
                <img
                  key={i}
                  src={`http://31.97.206.144:9124/uploads/banners/${img}`}
                  className="h-40 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
