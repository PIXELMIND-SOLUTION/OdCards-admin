// src/components/admin/CreateVisitingCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaUpload,
  FaImage,
  FaFile,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaCog,
  FaPalette,
  FaRuler,
  FaLayerGroup,
  FaFileAlt,
  FaTag,
  FaStickyNote,
  FaShoppingBag,
  FaBox,
  FaSearch,
  FaSync,
  FaFolder,
  FaTshirt,
  FaMagic,
  FaPrint,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import {
  MdCategory,
  MdLocalOffer,
  MdSettings,
  MdExpandMore,
  MdRefresh
} from 'react-icons/md';

const API_BASE_URL = 'http://31.97.206.144:9124/api';
const CATEGORIES_API_URL = 'http://31.97.206.144:9124/api/categories/allcategories';

const VisitingCardList = ( {darkMode} ) => {
  
  // State for form data
  const [formData, setFormData] = useState({
    'category.values': '',
    'subCategory.values': '',
    'productName.values': '',
    'quantity.isEnabled': true,
    'quantity.values': JSON.stringify([]),
    'printingType.isEnabled': true,
    'printingType.options': JSON.stringify([
      { label: 'Single Side', price: 0 },
      { label: 'Double Side', price: 100 }
    ]),
    'laminationType.isEnabled': true,
    'laminationType.options': JSON.stringify([
      { label: 'Glossy', price: 50 },
      { label: 'Matte', price: 75 },
      { label: 'None', price: 0 }
    ]),
    'features.boxPacking.isEnabled': true,
    'features.boxPacking.options': JSON.stringify([
      { label: 'Yes', price: 30 },
      { label: 'No', price: 0 }
    ]),
    'features.roundCorners.isEnabled': true,
    'features.roundCorners.options': JSON.stringify([
      { label: 'Yes', price: 20 },
      { label: 'No', price: 0 }
    ]),
    'features.bigSizeCard.isEnabled': true,
    'features.bigSizeCard.options': JSON.stringify([
      { label: 'Yes', price: 40 },
      { label: 'No', price: 0 }
    ]),
    'features.padding.isEnabled': true,
    'features.padding.options': JSON.stringify([
      { label: 'Yes', price: 25 },
      { label: 'No', price: 0 }
    ]),
    'features.creasing.isEnabled': true,
    'features.creasing.options': JSON.stringify([
      { label: 'Yes', price: 15 },
      { label: 'No', price: 0 }
    ]),
    'features.scoring.isEnabled': true,
    'features.scoring.options': JSON.stringify([
      { label: 'Yes', price: 18 },
      { label: 'No', price: 0 }
    ]),
    'features.shapeCutting.isEnabled': true,
    'features.shapeCutting.options': JSON.stringify([
      { label: 'Rectangle', price: 0 },
      { label: 'Round', price: 35 },
      { label: 'Custom', price: 50 }
    ]),
    'features.dieCut.isEnabled': true,
    'features.dieCut.options': JSON.stringify([
      { label: 'Yes', price: 45 },
      { label: 'No', price: 0 }
    ]),
    'cardSizeMultiplier.isEnabled': true,
    'cardSizeMultiplier.value': 1,
    'cardSizeMultiplier.price': 0,
    'size.isEnabled': true,
    'size.options': JSON.stringify([
      { label: 'Standard (3.5" x 2")', price: 0 },
      { label: 'Large (4" x 2.5")', price: 50 },
      { label: 'Custom', price: 100 }
    ]),
    'demmySize.isEnabled': true,
    'demmySize.options': JSON.stringify([
      { label: 'Standard Demo', price: 0 },
      { label: 'Special Demo', price: 25 },
      { label: 'Custom Demo', price: 50 }
    ]),
    'boardType.isEnabled': true,
    'boardType.options': JSON.stringify([
      { label: 'Art Paper', price: 0 },
      { label: 'Premium Card', price: 100 },
      { label: 'Ivory Board', price: 150 }
    ]),
    'boardThickness.isEnabled': true,
    'boardThickness.options': JSON.stringify([
      { label: '300 GSM', price: 0 },
      { label: '350 GSM', price: 50 },
      { label: '400 GSM', price: 100 }
    ]),
    'paperType.isEnabled': true,
    'paperType.options': JSON.stringify([
      { label: 'Matte', price: 0 },
      { label: 'Glossy', price: 30 },
      { label: 'Textured', price: 60 }
    ]),
    'gsm.isEnabled': true,
    'gsm.options': JSON.stringify([
      { label: '250 GSM', price: 0 },
      { label: '300 GSM', price: 40 },
      { label: '350 GSM', price: 80 }
    ]),
    'specialOptions.isEnabled': true,
    'specialOptions.options': JSON.stringify([
      { label: 'Spot UV', price: 80 },
      { label: 'Foil Printing', price: 120 },
      { label: 'Embossing', price: 100 }
    ]),
    'specialNotes.isEnabled': false,
    'specialNotes.value': '',
    'specialNotes.price': 0,
    'designFile.isEnabled': false,
    'designFile.price': 0,
    totalPrice: 0,
    status: 'draft'
  });

  // State for file uploads
  const [images, setImages] = useState([]);
  const [designFile, setDesignFile] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // State for orders
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // State for quantity array
  const [quantityValues, setQuantityValues] = useState([]);
  const [newQuantity, setNewQuantity] = useState('');
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Info', 'Features', 'Materials', 'Files & Pricing'];


  // Fetch all orders and categories on component mount
  useEffect(() => {
    fetchOrders();
    fetchCategories();
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(order =>
        order.category?.values?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName?.values?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.subCategory?.values?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  // Initialize quantity values from form data
  useEffect(() => {
    try {
      const values = JSON.parse(formData['quantity.values'] || '[]');
      setQuantityValues(values);
    } catch (err) {
      setQuantityValues([]);
    }
  }, [formData['quantity.values']]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/all`);
      setOrders(response.data.data);
      setFilteredOrders(response.data.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(CATEGORIES_API_URL);
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Quantity array handlers
  const addQuantityValue = () => {
    const value = parseInt(newQuantity);
    if (!isNaN(value) && value > 0) {
      const updatedValues = [...quantityValues, value].sort((a, b) => a - b);
      setQuantityValues(updatedValues);
      setFormData({
        ...formData,
        'quantity.values': JSON.stringify(updatedValues)
      });
      setNewQuantity('');
    }
  };

  const removeQuantityValue = (index) => {
    const updatedValues = [...quantityValues];
    updatedValues.splice(index, 1);
    setQuantityValues(updatedValues);
    setFormData({
      ...formData,
      'quantity.values': JSON.stringify(updatedValues)
    });
  };

  const handleArrayInputChange = (fieldName, index, key, value) => {
    try {
      const currentArray = JSON.parse(formData[fieldName] || '[]');
      currentArray[index][key] = key === 'price' ? Number(value) : value;
      
      setFormData({
        ...formData,
        [fieldName]: JSON.stringify(currentArray)
      });
    } catch (err) {
      console.error('Error parsing JSON:', err);
    }
  };

  const addArrayItem = (fieldName, defaultValue) => {
    try {
      const currentArray = JSON.parse(formData[fieldName] || '[]');
      currentArray.push(defaultValue || { label: '', price: 0 });
      
      setFormData({
        ...formData,
        [fieldName]: JSON.stringify(currentArray)
      });
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const removeArrayItem = (fieldName, index) => {
    try {
      const currentArray = JSON.parse(formData[fieldName] || '[]');
      currentArray.splice(index, 1);
      
      setFormData({
        ...formData,
        [fieldName]: JSON.stringify(currentArray)
      });
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDesignFileUpload = (e) => {
    setDesignFile(e.target.files[0]);
  };

  const calculateTotal = () => {
    let total = Number(formData.totalPrice) || 0;
    
    if (formData['designFile.isEnabled'] && formData['designFile.price']) {
      total += Number(formData['designFile.price']);
    }
    
    if (formData['specialNotes.isEnabled'] && formData['specialNotes.price']) {
      total += Number(formData['specialNotes.price']);
    }
    
    if (formData['cardSizeMultiplier.isEnabled'] && formData['cardSizeMultiplier.price']) {
      total += Number(formData['cardSizeMultiplier.price']);
    }
    
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const submitFormData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key]);
      });
      
      images.forEach((image) => {
        submitFormData.append('images', image);
      });
      
      if (designFile) {
        submitFormData.append('design', designFile);
      }
      
      submitFormData.append('totalPrice', calculateTotal().toString());
      
      let response;
      if (editingId) {
        response = await axios.patch(
          `${API_BASE_URL}/update/${editingId}`,
          submitFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setSuccess('Order updated successfully!');
      } else {
        response = await axios.post(
          `${API_BASE_URL}/create-visitingcard`,
          submitFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setSuccess('Order created successfully!');
      }
      
      resetForm();
      fetchOrders();
      setOpenDialog(false);
      setActiveStep(0);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingId(order._id);
    
    const flatData = {};
    
    const flattenObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else if (Array.isArray(value)) {
          flatData[newKey] = JSON.stringify(value);
        } else {
          flatData[newKey] = value;
        }
      });
    };
    
    flattenObject(order);
    
    setFormData(prev => ({
      ...prev,
      ...flatData,
      images: [],
      designFile: null
    }));
    
    setOpenDialog(true);
    setActiveStep(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`${API_BASE_URL}/delete/${id}`);
        setSuccess('Order deleted successfully!');
        fetchOrders();
      } catch (err) {
        setError('Failed to delete order');
      }
    }
  };

  const handleView = (order) => {
    setCurrentOrder(order);
    setOpenViewDialog(true);
  };

  const resetForm = () => {
    setFormData({
      'category.values': '',
      'subCategory.values': '',
      'productName.values': '',
      'quantity.isEnabled': true,
      'quantity.values': JSON.stringify([]),
      'printingType.isEnabled': true,
      'printingType.options': JSON.stringify([{ label: 'Single Side', price: 0 }, { label: 'Double Side', price: 100 }]),
      'laminationType.isEnabled': true,
      'laminationType.options': JSON.stringify([{ label: 'Glossy', price: 50 }, { label: 'Matte', price: 75 }, { label: 'None', price: 0 }]),
      'features.boxPacking.isEnabled': true,
      'features.boxPacking.options': JSON.stringify([{ label: 'Yes', price: 30 }, { label: 'No', price: 0 }]),
      'features.roundCorners.isEnabled': true,
      'features.roundCorners.options': JSON.stringify([{ label: 'Yes', price: 20 }, { label: 'No', price: 0 }]),
      'features.bigSizeCard.isEnabled': true,
      'features.bigSizeCard.options': JSON.stringify([{ label: 'Yes', price: 40 }, { label: 'No', price: 0 }]),
      'features.padding.isEnabled': true,
      'features.padding.options': JSON.stringify([{ label: 'Yes', price: 25 }, { label: 'No', price: 0 }]),
      'features.creasing.isEnabled': true,
      'features.creasing.options': JSON.stringify([{ label: 'Yes', price: 15 }, { label: 'No', price: 0 }]),
      'features.scoring.isEnabled': true,
      'features.scoring.options': JSON.stringify([{ label: 'Yes', price: 18 }, { label: 'No', price: 0 }]),
      'features.shapeCutting.isEnabled': true,
      'features.shapeCutting.options': JSON.stringify([{ label: 'Rectangle', price: 0 }, { label: 'Round', price: 35 }, { label: 'Custom', price: 50 }]),
      'features.dieCut.isEnabled': true,
      'features.dieCut.options': JSON.stringify([{ label: 'Yes', price: 45 }, { label: 'No', price: 0 }]),
      'cardSizeMultiplier.isEnabled': true,
      'cardSizeMultiplier.value': 1,
      'cardSizeMultiplier.price': 0,
      'size.isEnabled': true,
      'size.options': JSON.stringify([{ label: 'Standard (3.5" x 2")', price: 0 }, { label: 'Large (4" x 2.5")', price: 50 }, { label: 'Custom', price: 100 }]),
      'demmySize.isEnabled': true,
      'demmySize.options': JSON.stringify([{ label: 'Standard Demo', price: 0 }, { label: 'Special Demo', price: 25 }, { label: 'Custom Demo', price: 50 }]),
      'boardType.isEnabled': true,
      'boardType.options': JSON.stringify([{ label: 'Art Paper', price: 0 }, { label: 'Premium Card', price: 100 }, { label: 'Ivory Board', price: 150 }]),
      'boardThickness.isEnabled': true,
      'boardThickness.options': JSON.stringify([{ label: '300 GSM', price: 0 }, { label: '350 GSM', price: 50 }, { label: '400 GSM', price: 100 }]),
      'paperType.isEnabled': true,
      'paperType.options': JSON.stringify([{ label: 'Matte', price: 0 }, { label: 'Glossy', price: 30 }, { label: 'Textured', price: 60 }]),
      'gsm.isEnabled': true,
      'gsm.options': JSON.stringify([{ label: '250 GSM', price: 0 }, { label: '300 GSM', price: 40 }, { label: '350 GSM', price: 80 }]),
      'specialOptions.isEnabled': true,
      'specialOptions.options': JSON.stringify([{ label: 'Spot UV', price: 80 }, { label: 'Foil Printing', price: 120 }, { label: 'Embossing', price: 100 }]),
      'specialNotes.isEnabled': false,
      'specialNotes.value': '',
      'specialNotes.price': 0,
      'designFile.isEnabled': false,
      'designFile.price': 0,
      totalPrice: 0,
      status: 'draft'
    });
    setImages([]);
    setDesignFile(null);
    setImagePreviews([]);
    setQuantityValues([]);
    setNewQuantity('');
    setEditingId(null);
  };

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderOptionsArray = (fieldName, title, icon) => {
    try {
      const options = JSON.parse(formData[fieldName] || '[]');
      
      return (
        <div className="mb-4 border rounded-lg overflow-hidden">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 flex items-center justify-between cursor-pointer`}>
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium">{title}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {options.length} options
              </span>
            </div>
            <MdExpandMore className="text-gray-500" />
          </div>
          <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  className={`flex-1 px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Option Label"
                  value={option.label || ''}
                  onChange={(e) => handleArrayInputChange(fieldName, index, 'label', e.target.value)}
                />
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    className={`pl-8 pr-3 py-2 border rounded w-32 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Price"
                    value={option.price || 0}
                    onChange={(e) => handleArrayInputChange(fieldName, index, 'price', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                  onClick={() => removeArrayItem(fieldName, index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`w-full py-2 border border-dashed rounded flex items-center justify-center gap-2 ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => addArrayItem(fieldName, { label: '', price: 0 })}
            >
              <FaPlus /> Add Option
            </button>
          </div>
        </div>
      );
    } catch (err) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Invalid JSON format
        </div>
      );
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MdCategory /> Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category.values"
              value={formData['category.values']}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              required
            >
              <option value="">Select Category</option>
              {loadingCategories ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.category}>
                    {cat.category}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sub Category</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              placeholder="Enter sub category"
              name="subCategory.values"
              value={formData['subCategory.values']}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              placeholder="Enter product name"
              name="productName.values"
              value={formData['productName.values']}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaShoppingBag /> Quantity Options
        </h3>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="quantityEnabled"
            name="quantity.isEnabled"
            checked={formData['quantity.isEnabled']}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="quantityEnabled">Enable Quantity Options</label>
        </div>
        
        <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <label className="block text-sm font-medium mb-2">Add Quantity Values</label>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="number"
                className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                placeholder="Enter quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addQuantityValue()}
              />
              <span className="absolute right-3 top-2 text-gray-500">pcs</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              onClick={addQuantityValue}
            >
              <FaPlus /> Add
            </button>
          </div>
          
          {quantityValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {quantityValues.map((value, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full flex items-center gap-2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-800'}`}
                >
                  {value} pcs
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeQuantityValue(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No quantity values added. Add some values above.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaPrint /> Printing & Lamination
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="printingEnabled"
                name="printingType.isEnabled"
                checked={formData['printingType.isEnabled']}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="printingEnabled">Enable Printing Type</label>
            </div>
            {renderOptionsArray('printingType.options', 'Printing Options', <FaPalette />)}
          </div>
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="laminationEnabled"
                name="laminationType.isEnabled"
                checked={formData['laminationType.isEnabled']}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="laminationEnabled">Enable Lamination Type</label>
            </div>
            {renderOptionsArray('laminationType.options', 'Lamination Options', <FaLayerGroup />)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCog /> Features
        </h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure various features for your visiting cards
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'boxPacking', label: 'Box Packing', icon: <FaBox /> },
            { key: 'roundCorners', label: 'Round Corners', icon: <FaCheck /> },
            { key: 'bigSizeCard', label: 'Big Size Card', icon: <FaRuler /> },
            { key: 'padding', label: 'Padding', icon: <FaLayerGroup /> },
            { key: 'creasing', label: 'Creasing', icon: <FaFileAlt /> },
            { key: 'scoring', label: 'Scoring', icon: <FaFileAlt /> },
            { key: 'shapeCutting', label: 'Shape Cutting', icon: <FaPalette /> },
            { key: 'dieCut', label: 'Die Cut', icon: <FaCog /> },
          ].map((feature) => (
            <div key={feature.key}>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id={`${feature.key}Enabled`}
                  name={`features.${feature.key}.isEnabled`}
                  checked={formData[`features.${feature.key}.isEnabled`]}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor={`${feature.key}Enabled`} className="flex items-center gap-2">
                  {feature.icon}
                  {feature.label}
                </label>
              </div>
              {renderOptionsArray(
                `features.${feature.key}.options`,
                `${feature.label} Options`,
                feature.icon
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaRuler /> Size Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="sizeEnabled"
                name="size.isEnabled"
                checked={formData['size.isEnabled']}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="sizeEnabled">Enable Size Options</label>
            </div>
            {renderOptionsArray('size.options', 'Card Sizes', <FaRuler />)}
          </div>
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="demmySizeEnabled"
                name="demmySize.isEnabled"
                checked={formData['demmySize.isEnabled']}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label htmlFor="demmySizeEnabled">Enable Demo Size Options</label>
            </div>
            {renderOptionsArray('demmySize.options', 'Demo Sizes', <FaRuler />)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaterialsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaLayerGroup /> Material Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'boardType', label: 'Board Type', icon: <FaLayerGroup /> },
            { key: 'boardThickness', label: 'Board Thickness', icon: <FaLayerGroup /> },
            { key: 'paperType', label: 'Paper Type', icon: <FaFileAlt /> },
            { key: 'gsm', label: 'GSM', icon: <FaRuler /> },
          ].map((material) => (
            <div key={material.key}>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id={`${material.key}Enabled`}
                  name={`${material.key}.isEnabled`}
                  checked={formData[`${material.key}.isEnabled`]}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor={`${material.key}Enabled`} className="flex items-center gap-2">
                  {material.icon}
                  {material.label}
                </label>
              </div>
              {renderOptionsArray(
                `${material.key}.options`,
                `${material.label} Options`,
                material.icon
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaTag /> Special Options
        </h3>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="specialOptionsEnabled"
            name="specialOptions.isEnabled"
            checked={formData['specialOptions.isEnabled']}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="specialOptionsEnabled">Enable Special Options</label>
        </div>
        {renderOptionsArray('specialOptions.options', 'Special Options', <FaTag />)}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaStickyNote /> Card Size Multiplier
        </h3>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="sizeMultiplierEnabled"
            name="cardSizeMultiplier.isEnabled"
            checked={formData['cardSizeMultiplier.isEnabled']}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="sizeMultiplierEnabled">Enable Card Size Multiplier</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Multiplier Value</label>
            <div className="relative">
              <input
                type="number"
                className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                name="cardSizeMultiplier.value"
                value={formData['cardSizeMultiplier.value']}
                onChange={handleInputChange}
              />
              <span className="absolute right-3 top-2 text-gray-500">x</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                name="cardSizeMultiplier.price"
                value={formData['cardSizeMultiplier.price']}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilesPricingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaImage /> File Uploads
        </h3>
        
        {/* Images Upload */}
        <div className={`border rounded-lg p-4 mb-6 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <FaImage /> Product Images
          </h4>
          <div className="mb-4">
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
              <FaUpload className="mr-2" />
              Upload Images
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {images.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {images.length} image(s) selected
              </p>
            )}
          </div>
          
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    onClick={() => {
                      const newImages = [...images];
                      const newPreviews = [...imagePreviews];
                      newImages.splice(index, 1);
                      newPreviews.splice(index, 1);
                      setImages(newImages);
                      setImagePreviews(newPreviews);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Design File Upload */}
        <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="designFileEnabled"
              name="designFile.isEnabled"
              checked={formData['designFile.isEnabled']}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="designFileEnabled" className="flex items-center gap-2">
              <FaFile /> Enable Design File Upload
            </label>
          </div>
          <div className="mb-4">
            <label className={`inline-flex items-center px-4 py-2 border rounded cursor-pointer ${!formData['designFile.isEnabled'] ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <FaUpload className="mr-2" />
              Upload Design File
              <input
                type="file"
                className="hidden"
                onChange={handleDesignFileUpload}
                disabled={!formData['designFile.isEnabled']}
              />
            </label>
            {designFile && (
              <p className="text-sm text-gray-500 mt-2">
                File: {designFile.name}
              </p>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">₹</span>
            <input
              type="number"
              className={`w-full pl-8 pr-3 py-2 border rounded ${!formData['designFile.isEnabled'] ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              placeholder="Design File Price"
              name="designFile.price"
              value={formData['designFile.price']}
              onChange={handleInputChange}
              disabled={!formData['designFile.isEnabled']}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaStickyNote /> Special Notes
        </h3>
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="specialNotesEnabled"
            name="specialNotes.isEnabled"
            checked={formData['specialNotes.isEnabled']}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="specialNotesEnabled">Enable Special Notes</label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <textarea
              className={`w-full px-3 py-2 border rounded ${!formData['specialNotes.isEnabled'] ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
              rows="3"
              placeholder="Add special notes..."
              name="specialNotes.value"
              value={formData['specialNotes.value']}
              onChange={handleInputChange}
              disabled={!formData['specialNotes.isEnabled']}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2 border rounded ${!formData['specialNotes.isEnabled'] ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                name="specialNotes.price"
                value={formData['specialNotes.price']}
                onChange={handleInputChange}
                disabled={!formData['specialNotes.isEnabled']}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MdLocalOffer /> Pricing & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Base Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                className={`w-full pl-8 pr-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className={`rounded-lg p-6 ${darkMode ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900'}`}>
          <h4 className="text-lg font-semibold mb-4">Total Price Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>₹{Number(formData.totalPrice) || 0}</span>
            </div>
            {formData['designFile.isEnabled'] && formData['designFile.price'] > 0 && (
              <div className="flex justify-between">
                <span>Design File:</span>
                <span>₹{Number(formData['designFile.price']) || 0}</span>
              </div>
            )}
            {formData['specialNotes.isEnabled'] && formData['specialNotes.price'] > 0 && (
              <div className="flex justify-between">
                <span>Special Notes:</span>
                <span>₹{Number(formData['specialNotes.price']) || 0}</span>
              </div>
            )}
            {formData['cardSizeMultiplier.isEnabled'] && formData['cardSizeMultiplier.price'] > 0 && (
              <div className="flex justify-between">
                <span>Size Multiplier:</span>
                <span>₹{Number(formData['cardSizeMultiplier.price']) || 0}</span>
              </div>
            )}
            <hr className={`my-3 ${darkMode ? 'border-blue-700' : 'border-blue-200'}`} />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderFeaturesStep();
      case 2:
        return renderMaterialsStep();
      case 3:
        return renderFilesPricingStep();
      default:
        return renderBasicInfoStep();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaShoppingBag className="text-4xl text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Visiting Card Orders Management</h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create and manage visiting card orders with customizable options
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-8">
              <button
                onClick={() => handleTabChange(0)}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${tabValue === 0
                  ? `${darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'}`
                  : `${darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaEye />
                  View Orders
                </div>
              </button>
              {/* <button
                onClick={() => handleTabChange(1)}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${tabValue === 1
                  ? `${darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'}`
                  : `${darkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaPlus />
                  Create New Order
                </div>
              </button> */}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                ×
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                ×
              </button>
            </div>
          </div>
        )}

        {/* View Orders Tab */}
        {tabValue === 0 && (
          <>
            {/* Search and Create Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  className={`pl-10 pr-4 py-2 w-full md:w-96 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchOrders}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <MdRefresh />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setOpenDialog(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus />
                  Create New Order
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-6 ${darkMode ? 'bg-blue-800' : 'bg-blue-600'} text-white`}>
                <div className="text-sm opacity-90">Total Orders</div>
                <div className="text-3xl font-bold mt-2">{orders.length}</div>
              </div>
              <div className={`rounded-lg p-6 ${darkMode ? 'bg-green-800' : 'bg-green-600'} text-white`}>
                <div className="text-sm opacity-90">Published</div>
                <div className="text-3xl font-bold mt-2">
                  {orders.filter(o => o.status === 'published').length}
                </div>
              </div>
              <div className={`rounded-lg p-6 ${darkMode ? 'bg-yellow-800' : 'bg-yellow-600'} text-white`}>
                <div className="text-sm opacity-90">Draft</div>
                <div className="text-3xl font-bold mt-2">
                  {orders.filter(o => o.status === 'draft').length}
                </div>
              </div>
              <div className={`rounded-lg p-6 ${darkMode ? 'bg-purple-800' : 'bg-purple-600'} text-white`}>
                <div className="text-sm opacity-90">Categories</div>
                <div className="text-3xl font-bold mt-2">{categories.length}</div>
              </div>
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className={`rounded-lg overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="px 6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="text-gray-500 dark:text-gray-400">
                              <FaShoppingBag className="mx-auto h-12 w-12 mb-3 opacity-50" />
                              <p className="text-lg">No orders found</p>
                              <p className="text-sm mt-1">Create your first order to get started!</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {order.images?.values?.[0] && (
                                  <img
                                    src={order.images.values[0]}
                                    alt={order.productName?.values}
                                    className="h-10 w-10 rounded-lg object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{order.productName?.values}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {order.subCategory?.values}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                <MdCategory className="mr-1" />
                                {order.category?.values}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'published' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : order.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold">₹{order.totalPrice || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleView(order)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => handleEdit(order)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(order._id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Form Dialog */}
        {openDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header */}
                <div className={`px-6 py-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-600'} text-white`}>
                  <div className="flex items-center gap-3">
                    {editingId ? <FaEdit /> : <FaPlus />}
                    <h3 className="text-lg font-semibold">
                      {editingId ? 'Edit Visiting Card Order' : 'Create New Visiting Card Order'}
                    </h3>
                  </div>
                </div>

                {/* Stepper */}
                <div className="px-6 pt-4">
                  <div className="flex justify-between">
                    {steps.map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${index <= activeStep 
                          ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}` 
                          : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`
                        }`}>
                          {index + 1}
                        </div>
                        <div className={`ml-2 text-sm font-medium ${index === activeStep ? 'text-blue-600 dark:text-blue-400' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-12 h-0.5 mx-2 ${index < activeStep ? 'bg-blue-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className={`max-h-[60vh] overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <form onSubmit={handleSubmit}>
                    {renderStepContent(activeStep)}
                  </form>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <div>
                      {activeStep > 0 && (
                        <button
                          type="button"
                          onClick={handleBackStep}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                          disabled={loading}
                        >
                          <FaArrowLeft />
                          Back
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDialog(false);
                          setActiveStep(0);
                        }}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      {activeStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          disabled={loading}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : editingId ? (
                            <>
                              <FaSave />
                              Update Order
                            </>
                          ) : (
                            <>
                              <FaSave />
                              Create Order
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Order Dialog */}
        {openViewDialog && currentOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header */}
                <div className={`px-6 py-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-600'} text-white`}>
                  <div className="flex items-center gap-3">
                    <FaShoppingBag />
                    <h3 className="text-lg font-semibold">Order Details</h3>
                  </div>
                </div>

                {/* Content */}
                <div className={`max-h-[70vh] overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  {/* Header Info */}
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{currentOrder.productName?.values}</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            <MdCategory className="mr-1" />
                            {currentOrder.category?.values}
                          </span>
                          {currentOrder.subCategory?.values && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                              {currentOrder.subCategory.values}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div>
                          <div className="text-sm opacity-75">Status</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentOrder.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : currentOrder.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {currentOrder.status}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm opacity-75">Total Price</div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{currentOrder.totalPrice || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  {currentOrder.images?.values?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FaImage /> Product Images
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {currentOrder.images.values.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img}
                              alt={`Product ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuration Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <FaCog /> Configuration Details
                    </h4>

                    {/* Basic Info */}
                    {currentOrder.quantity?.isEnabled && currentOrder.quantity?.values?.length > 0 && (
                      <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h5 className="text-sm font-medium mb-2 opacity-75">Quantity Options</h5>
                        <div className="flex flex-wrap gap-2">
                          {currentOrder.quantity.values.map((qty, idx) => (
                            <span key={idx} className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              {qty} pcs
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {Object.entries(currentOrder.features || {}).map(([key, feature]) => {
                      if (feature.isEnabled && feature.options?.length > 0) {
                        return (
                          <div key={key} className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <h5 className="text-sm font-medium mb-2 opacity-75">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {feature.options.map((option, idx) => (
                                <div key={idx} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white border'}`}>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-green-600 dark:text-green-400 text-sm">
                                    ₹{option.price}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}

                    {/* Other Options */}
                    {['printingType', 'laminationType', 'size', 'demmySize', 'boardType', 'boardThickness', 'paperType', 'gsm', 'specialOptions']
                      .filter(key => currentOrder[key]?.isEnabled && currentOrder[key]?.options?.length > 0)
                      .map(key => (
                        <div key={key} className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <h5 className="text-sm font-medium mb-2 opacity-75">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {currentOrder[key].options.map((option, idx) => (
                              <div key={idx} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white border'}`}>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-green-600 dark:text-green-400 text-sm">
                                  ₹{option.price}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                    {/* Special Notes */}
                    {currentOrder.specialNotes?.isEnabled && currentOrder.specialNotes?.value && (
                      <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h5 className="text-sm font-medium mb-2 opacity-75">Special Notes</h5>
                        <p className="mb-2">{currentOrder.specialNotes.value}</p>
                        {currentOrder.specialNotes.price > 0 && (
                          <div className="text-green-600 dark:text-green-400 text-sm">
                            Additional Cost: ₹{currentOrder.specialNotes.price}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Design File */}
                    {currentOrder.designFile?.isEnabled && currentOrder.designFile?.value && (
                      <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <h5 className="text-sm font-medium mb-2 opacity-75">Design File</h5>
                        <a
                          href={currentOrder.designFile.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FaFile />
                          View Design File
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div>Order ID: {currentOrder._id}</div>
                      <div className="mt-1">
                        Created: {new Date(currentOrder.createdAt).toLocaleString()} • 
                        Last Updated: {new Date(currentOrder.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenViewDialog(false)}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenViewDialog(false);
                        handleEdit(currentOrder);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitingCardList;