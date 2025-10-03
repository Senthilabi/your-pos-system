import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Modal, Button, Input } from '../../../shared/components/ui';
import { useForm } from '../../../shared/hooks';

const ProductModal = () => {
  const { state, createProduct, updateProduct, hideModal } = useInventory();
  const isEditing = !!state.editingItem;
  
  const validationRules = {
    name: [{ required: true, message: 'Product name is required' }],
    price: [
      { required: true, message: 'Price is required' },
      { 
        custom: (value) => value > 0,
        message: 'Price must be greater than 0'
      }
    ],
    cost: [
      { required: true, message: 'Cost is required' },
      { 
        custom: (value) => value >= 0,
        message: 'Cost must be 0 or greater'
      }
    ],
    stock: [
      { required: true, message: 'Stock quantity is required' },
      { 
        custom: (value) => value >= 0,
        message: 'Stock must be 0 or greater'
      }
    ],
    reorderLevel: [
      { 
        custom: (value) => !value || value >= 0,
        message: 'Reorder level must be 0 or greater'
      }
    ]
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue
  } = useForm({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    reorderLevel: '',
    image: ''
  }, validationRules);

  // Load editing data
  useEffect(() => {
    if (state.showProductModal && state.editingItem) {
      const product = state.editingItem;
      Object.keys(values).forEach(key => {
        setFieldValue(key, product[key] || '');
      });
    } else if (state.showProductModal) {
      reset();
    }
  }, [state.showProductModal, state.editingItem, reset, setFieldValue, values]);

  const onSubmit = async (formData) => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : 5
      };

      if (isEditing) {
        await updateProduct(state.editingItem.id, productData);
      } else {
        await createProduct(productData);
      }

      hideModal('Product');
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleClose = () => {
    hideModal('Product');
    reset();
  };

  return (
    <Modal
      isOpen={state.showProductModal}
      onClose={handleClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      size="lg"
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={() => handleSubmit(onSubmit)}>
            {isEditing ? 'Update' : 'Create'} Product
          </Button>
        </div>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            placeholder="Enter product name"
          />
          
          <Input
            label="SKU"
            value={values.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Auto-generated if empty"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Category"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="e.g. Beverages, Food, Electronics"
          />
          
          <Input
            label="Barcode"
            value={values.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="Product barcode"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price *"
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
            onBlur={() => handleBlur('price')}
            error={errors.price}
            placeholder="0.00"
          />
          
          <Input
            label="Cost *"
            type="number"
            step="0.01"
            value={values.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            onBlur={() => handleBlur('cost')}
            error={errors.cost}
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Stock Quantity *"
            type="number"
            value={values.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            onBlur={() => handleBlur('stock')}
            error={errors.stock}
            placeholder="0"
          />
          
          <Input
            label="Reorder Level"
            type="number"
            value={values.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', e.target.value)}
            onBlur={() => handleBlur('reorderLevel')}
            error={errors.reorderLevel}
            placeholder="5"
            helpText="Alert when stock falls below this level"
          />
        </div>

        <Input
          label="Description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Product description (optional)"
        />

        <Input
          label="Image Emoji"
          value={values.image}
          onChange={(e) => handleChange('image', e.target.value)}
          placeholder="📦"
          helpText="Enter an emoji to represent this product"
        />
      </form>
    </Modal>
  );
};

export default ProductModal;
