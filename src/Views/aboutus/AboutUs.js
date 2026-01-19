import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaMoon,
  FaSun
} from "react-icons/fa";

const AboutUs = ( {darkMode} ) => {
  const [activeTab, setActiveTab] = useState("about");

  /* ================= ABOUT STATE ================= */
  const [aboutData, setAboutData] = useState({ description: "", image: null });
  const [aboutPreview, setAboutPreview] = useState(null);
  const [existingAboutImage, setExistingAboutImage] = useState(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [currentAboutId, setCurrentAboutId] = useState(null);

  /* ================= CARD STATE ================= */
  const [cards, setCards] = useState([]);
  const [cardForm, setCardForm] = useState({
    title: "",
    description: "",
    count: "",
    image: null
  });
  const [cardPreview, setCardPreview] = useState(null);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [currentCardId, setCurrentCardId] = useState(null);

  const [loadingAbout, setLoadingAbout] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchAboutData();
    fetchCardData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/aboutus/about"
      );
      if (res.data.length) {
        const a = res.data[0];
        setAboutData({ description: a.description, image: null });
        setExistingAboutImage(a.image);
        setCurrentAboutId(a._id);
        setIsEditingAbout(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAbout(false);
    }
  };

  const fetchCardData = async () => {
    try {
      const res = await axios.get(
        "http://31.97.206.144:9124/api/aboutcard/getallcards"
      );
      setCards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCards(false);
    }
  };

  /* ================= ABOUT HANDLERS ================= */
  const submitAbout = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("description", aboutData.description);
    if (aboutData.image) data.append("image", aboutData.image);

    try {
      if (isEditingAbout) {
        await axios.put(
          `http://31.97.206.144:9124/api/aboutus/updateabout/${currentAboutId}`,
          data
        );
        Swal.fire("Success", "About updated", "success");
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/aboutus/create-about",
          data
        );
        Swal.fire("Success", "About created", "success");
      }
      fetchAboutData();
    } catch {
      Swal.fire("Error", "Failed to save", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= CARD HANDLERS ================= */
  const submitCard = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    Object.entries(cardForm).forEach(([k, v]) => v && data.append(k, v));

    try {
      if (isEditingCard) {
        await axios.put(
          `http://31.97.206.144:9124/api/aboutcard/updatecard/${currentCardId}`,
          data
        );
        Swal.fire("Updated", "Card updated", "success");
      } else {
        await axios.post(
          "http://31.97.206.144:9124/api/aboutcard/create-card",
          data
        );
        Swal.fire("Created", "Card created", "success");
      }
      resetCard();
      fetchCardData();
    } catch {
      Swal.fire("Error", "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetCard = () => {
    setCardForm({ title: "", description: "", count: "", image: null });
    setCardPreview(null);
    setIsEditingCard(false);
    setCurrentCardId(null);
  };

  const deleteCard = async (id) => {
    const ok = await Swal.fire({
      title: "Delete?",
      showCancelButton: true,
      icon: "warning"
    });
    if (!ok.isConfirmed) return;

    await axios.delete(
      `http://31.97.206.144:9124/api/aboutcard/deletecard/${id}`
    );
    fetchCardData();
  };

  /* ================= UI ================= */
  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"} min-h-screen p-6`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Management</h1>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {["about", "cards"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : darkMode
                ? "bg-gray-800"
                : "bg-white"
            }`}
          >
            {tab === "about" ? "About Us" : "Card Categories"}
          </button>
        ))}
      </div>

      {/* ABOUT TAB */}
      {activeTab === "about" && (
        <form
          onSubmit={submitAbout}
          className={`p-6 rounded-xl shadow ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
        >
          <textarea
            value={aboutData.description}
            onChange={(e) =>
              setAboutData({ ...aboutData, description: e.target.value })
            }
            className="w-full h-40 p-4 rounded border"
            required
          />

          <input
            type="file"
            className="mt-4"
            onChange={(e) =>
              setAboutData({ ...aboutData, image: e.target.files[0] })
            }
          />

          {existingAboutImage && (
            <img
              src={`http://31.97.206.144:9124${existingAboutImage}`}
              className="mt-4 w-48 rounded"
            />
          )}

          <button
            disabled={submitting}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {/* CARDS TAB */}
      {activeTab === "cards" && (
        <>
          {/* FORM */}
          <form
            onSubmit={submitCard}
            className={`p-6 mb-6 rounded-xl shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <input
              placeholder="Title"
              value={cardForm.title}
              onChange={(e) =>
                setCardForm({ ...cardForm, title: e.target.value })
              }
              className="w-full p-2 mb-2 rounded border"
              required
            />
            <input
              placeholder="Count"
              type="number"
              value={cardForm.count}
              onChange={(e) =>
                setCardForm({ ...cardForm, count: e.target.value })
              }
              className="w-full p-2 mb-2 rounded border"
              required
            />
            <textarea
              placeholder="Description"
              value={cardForm.description}
              onChange={(e) =>
                setCardForm({ ...cardForm, description: e.target.value })
              }
              className="w-full p-2 mb-2 rounded border"
              required
            />
            <input
              type="file"
              onChange={(e) =>
                setCardForm({ ...cardForm, image: e.target.files[0] })
              }
            />

            <div className="flex gap-2 mt-4">
              {isEditingCard && (
                <button
                  type="button"
                  onClick={resetCard}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  <FaTimes />
                </button>
              )}
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded"
              >
                <FaSave /> Save
              </button>
            </div>
          </form>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden">
              <thead className={`${darkMode ? "bg-gray-700 text-white" : "bg-indigo-600 text-white"}`}>
                <tr>
                  <th className="p-3">Image</th>
                  <th>Title</th>
                  <th>Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c._id} className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} "border-b"`}>
                    <td className="p-2">
                      <img
                        src={`http://31.97.206.144:9124${c.image}`}
                        className="w-14 rounded"
                      />
                    </td>
                    <td>{c.title}</td>
                    <td>{c.count}</td>
                    <td className="flex gap-2 p-2">
                      <button
                        onClick={() => {
                          setCardForm(c);
                          setCurrentCardId(c._id);
                          setIsEditingCard(true);
                        }}
                        className="text-yellow-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteCard(c._id)}
                        className="text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AboutUs;
