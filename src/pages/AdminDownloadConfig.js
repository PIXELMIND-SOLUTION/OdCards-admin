import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Download,
  Settings,
  Image,
  Video,
  Coins,
  ToggleLeft,
  ToggleRight,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";

/* ===============================
   API CONFIG
================================ */
const API_BASE = "http://194.164.148.237:5002/api";

/* ===============================
   MAIN COMPONENT
================================ */
const AdminDownloadConfig = ({ darkMode }) => {
  const [configs, setConfigs] = useState([]);
  const [mediaType, setMediaType] = useState("image");
  const [coins, setCoins] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  /* ===============================
     SHOW NOTIFICATION
  ================================ */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ===============================
     FETCH ALL CONFIGS
  ================================ */
  const fetchConfigs = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/download-config`);
      setConfigs(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      showNotification("Failed to load configurations", "error");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  /* ===============================
     SUBMIT CREATE / UPDATE
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coins || isNaN(coins) || Number(coins) < 0) {
      showNotification("Please enter a valid coin amount", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/download-config`, {
        mediaType,
        coins: Number(coins),
        isActive
      });

      setCoins("");
      setMediaType("image");
      setIsActive(true);
      fetchConfigs();
      showNotification("Configuration saved successfully!");
    } catch (err) {
      showNotification(err.response?.data?.message || "Error saving configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     TOGGLE ENABLE / DISABLE
  ================================ */
  const toggleConfig = async (type) => {
    try {
      await axios.patch(`${API_BASE}/download-config/${type}/toggle`);
      fetchConfigs();
      const config = configs.find(cfg => cfg.mediaType === type);
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} downloads ${config?.isActive ? 'disabled' : 'enabled'}`);
    } catch {
      showNotification("Failed to toggle configuration", "error");
    }
  };

  /* ===============================
     DELETE CONFIG
  ================================ */
  const deleteConfig = async (type) => {
    if (!window.confirm(`Are you sure you want to delete ${type} configuration?`)) return;
    
    try {
      await axios.delete(`${API_BASE}/download-config/${type}`);
      fetchConfigs();
      showNotification(`${type} configuration deleted`);
    } catch {
      showNotification("Failed to delete configuration", "error");
    }
  };

  /* ===============================
     NOTIFICATION COMPONENT
  ================================ */
  const Notification = () => {
    if (!notification) return null;

    const { message, type } = notification;
    
    return (
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className={`
          rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px]
          ${type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
          }
        `}>
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              type === 'success' 
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            }`}>
              {message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`p-1 rounded-lg ${
              type === 'success' 
                ? 'hover:bg-green-200/50 dark:hover:bg-green-800/50'
                : 'hover:bg-red-200/50 dark:hover:bg-red-800/50'
            }`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${darkMode ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
              <Download className={`w-6 h-6 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Download Configuration
              </h1>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Manage coin charges for media downloads
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className={`
          rounded-2xl shadow-lg overflow-hidden
          ${darkMode 
            ? "bg-gray-900/50 backdrop-blur-sm border border-gray-800" 
            : "bg-white border border-gray-200"
          }
        `}>
          {/* Configuration Form */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
              <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Set Download Charges
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Media Type Select */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Media Type
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {mediaType === "image" ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-xl text-sm
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                        ${darkMode
                          ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                        }
                      `}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>

                {/* Coins Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Coins Required
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <Coins className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="Enter coin amount"
                      value={coins}
                      onChange={(e) => setCoins(e.target.value)}
                      required
                      min="0"
                      step="1"
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-xl text-sm
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                        ${darkMode
                          ? "bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                        }
                      `}
                    />
                  </div>
                </div>

                {/* Status Select */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Status
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <select
                      value={isActive}
                      onChange={(e) => setIsActive(e.target.value === "true")}
                      className={`
                        w-full pl-10 pr-4 py-3 rounded-xl text-sm
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                        ${darkMode
                          ? "bg-gray-800 border border-gray-700 text-white"
                          : "bg-white border border-gray-300 text-gray-900"
                        }
                      `}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      w-full px-4 py-3 rounded-xl font-semibold text-sm md:text-base
                      transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                      flex items-center justify-center gap-2
                      ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      }
                      text-white shadow-lg
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Divider */}
          <div className={`h-px ${darkMode ? "bg-gray-800" : "bg-gray-200"}`} />

          {/* Configurations Table */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Current Configurations
                </h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {configs.length} configuration{configs.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={fetchConfigs}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  flex items-center gap-2
                  ${darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }
                `}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {tableLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Loading configurations...
                </p>
              </div>
            ) : configs.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${
                darkMode ? "bg-gray-800/50" : "bg-gray-100"
              }`}>
                <Download className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`} />
                <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  No configurations found
                </p>
                <p className={`text-sm mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Add your first configuration above
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full">
                  <thead className={`
                    ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}
                    rounded-t-xl overflow-hidden
                  `}>
                    <tr>
                      <th className={`p-3 md:p-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Media Type
                      </th>
                      <th className={`p-3 md:p-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Coins Required
                      </th>
                      <th className={`p-3 md:p-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Status
                      </th>
                      <th className={`p-3 md:p-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-800" : "divide-gray-200"}`}>
                    {configs.map((cfg) => (
                      <tr 
                        key={cfg._id}
                        className={`
                          transition-colors duration-200
                          ${darkMode 
                            ? "hover:bg-gray-800/30" 
                            : "hover:bg-gray-50"
                          }
                        `}
                      >
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              darkMode ? "bg-gray-800" : "bg-gray-100"
                            }`}>
                              {cfg.mediaType === "image" ? (
                                <Image className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                              ) : (
                                <Video className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium capitalize ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}>
                                {cfg.mediaType}
                              </p>
                              <p className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-600"
                              }`}>
                                {cfg.mediaType === "image" ? "JPEG, PNG, GIF" : "MP4, AVI, MOV"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-2">
                            <Coins className={`w-4 h-4 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                            <span className={`text-lg font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {cfg.coins}
                            </span>
                            <span className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              coins
                            </span>
                          </div>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-2">
                            <span className={`
                              px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1
                              ${cfg.isActive
                                ? darkMode
                                  ? "bg-green-900/30 text-green-400 border border-green-800"
                                  : "bg-green-100 text-green-800"
                                : darkMode
                                  ? "bg-red-900/30 text-red-400 border border-red-800"
                                  : "bg-red-100 text-red-800"
                              }
                            `}>
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                              {cfg.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleConfig(cfg.mediaType)}
                              className={`
                                px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                                flex items-center gap-1.5
                                ${cfg.isActive
                                  ? darkMode
                                    ? "bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-800"
                                    : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                  : darkMode
                                    ? "bg-green-900/30 hover:bg-green-800/50 text-green-400 border border-green-800"
                                    : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                                }
                              `}
                            >
                              {cfg.isActive ? (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Enable
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteConfig(cfg.mediaType)}
                              className={`
                                px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                                flex items-center gap-1.5
                                ${darkMode
                                  ? "bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                                }
                              `}
                            >
                              <AlertCircle className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className={`mt-6 md:mt-8 rounded-xl p-4 md:p-6 ${
          darkMode ? "bg-blue-900/20 border border-blue-800" : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <div>
              <h3 className={`font-semibold ${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                How it works
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                Users will be charged the specified number of coins when downloading media. 
                Current charges: {configs.find(c => c.mediaType === 'image')?.coins || 'X'} coins for images and {configs.find(c => c.mediaType === 'video')?.coins || 'X'} coins for videos. 
                Disabled configurations won't charge users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification />
    </div>
  );
};

export default AdminDownloadConfig;