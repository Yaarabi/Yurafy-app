'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { IOrder } from '@/models/store/orders';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';

interface ProductItem {
    product?: string; // Product ID (optional)
    name: string;     // Product name (required)
    quantity: number;
    price: number;
    color?: string;
    size?: string;
}

interface OwnerProduct {
    _id: string;
    name: string;
    price: number;
    colors?: string[];
    sizes?: string[];
    variants?: Array<{
        color?: string;
        size?: string;
        price?: number;
    }>;
}

interface AddOrderModalProps {
    show: boolean;
    onClose: () => void;
    onAddOrder: (order: IOrder) => void;
}

export default function AddOrderModal({ show, onClose, onAddOrder }: AddOrderModalProps) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [status, setStatus] = useState<IOrder['status']>('new');
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [ownerProducts, setOwnerProducts] = useState<OwnerProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Fetch owner's products
    useEffect(() => {
        if (!show) return;
        
        async function fetchProducts() {
            setLoadingProducts(true);
            try {
                const res = await fetch('/api/products/user');
                if (res.ok) {
                    const data = await res.json();
                    setOwnerProducts(data.products || []);
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoadingProducts(false);
            }
        }
        
        fetchProducts();
    }, [show]);

    if (!show) return null;

    const addProduct = () =>
        setProducts([...products, { product: '', name: '', quantity: 1, price: 0 }]);

    const handleProductSelect = (index: number, productId: string) => {
        const selectedProduct = ownerProducts.find(p => p._id === productId);
        if (!selectedProduct) return;

        const updated = [...products];
        updated[index] = {
            product: selectedProduct._id,
            name: selectedProduct.name,
            quantity: 1,
            price: selectedProduct.price,
            color: '',
            size: ''
        };
        setProducts(updated);

        // Update total
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const handleVariantSelect = (index: number, variantIndex: number) => {
        const updated = [...products];
        const selectedProduct = ownerProducts.find(p => p._id === updated[index].product);
        if (!selectedProduct || !selectedProduct.variants) return;

        const variant = selectedProduct.variants[variantIndex];
        if (variant) {
            updated[index].color = variant.color || '';
            updated[index].size = variant.size || '';
            updated[index].price = variant.price || selectedProduct.price;
        }
        setProducts(updated);

        // Update total
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const updateProduct = (index: number, field: keyof ProductItem, value: string | number) => {
        const updated = [...products];
        (updated[index] as any)[field] = 
            field === 'quantity' || field === 'price' ? Number(value) : String(value);
        setProducts(updated);

        // Update total
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const removeProduct = (index: number) => {
        const updated = [...products];
        updated.splice(index, 1);
        setProducts(updated);
        const total = updated.reduce((sum, p) => sum + p.price * p.quantity, 0);
        setTotalAmount(total);
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        // Validate phone number - must be more than just country code
        const phoneDigits = phone.replace(/\D/g, ''); // Remove all non-digits
        if (!phone || phone.trim() === '' || phoneDigits.length < 10) {
            toast.error('Phone number is required. Please enter a complete phone number (not just country code).');
            setLoading(false);
            return;
        }

        if (!fullName || !address || products.length === 0 || products.some(p => !p.name)) {
            toast.error('Please fill all required fields and add at least one product with a name.');
            setLoading(false);
            return;
        }

        // Normalize phone number to E.164 format before sending
        const normalizedPhone = normalizePhoneNumber(phone);

        const newOrder: Partial<IOrder> = {
            shippingAddress: { fullName, phone: normalizedPhone, address },
            products,
            totalAmount,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
            owner: '', // backend will populate
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder),
            });

            const data = await res.json();

            if (res.ok) {
                // WhatsApp trigger logic (frontend)
                const waRes = await fetch('/api/whatsapp/trigger/manually', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: data.order._id, owner: data.order.owner })
                });
                const waData = await waRes.json();
                if (!waRes.ok || waData.error) {
                    toast.error(waData.error || 'WhatsApp trigger failed');
                } else if (waData.confirmationRequired) {
                    if (window.confirm(waData.message || 'Do you want to send the WhatsApp template?')) {
                        const waConfirmRes = await fetch('/api/whatsapp/trigger/manually', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: data.order._id, owner: data.order.owner, confirmed: true })
                        });
                        const waConfirmData = await waConfirmRes.json();
                        if (!waConfirmRes.ok || waConfirmData.error) {
                            toast.error(waConfirmData.error || 'WhatsApp trigger failed');
                        }
                    }
                }
                onAddOrder(data.order);
                toast.success('Order added successfully!');
                onClose();
                setFullName(''); setPhone(''); setAddress('');
                setProducts([]); setStatus('new'); setTotalAmount(0);
            } else {
                toast.error(data.error?.message || data.error || 'Failed to add order');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Server error while adding order');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-4 sm:pt-10 md:pt-20 z-50 overflow-auto p-2 sm:p-4">
            <div className="bg-gray-800 text-gray-200 rounded-lg p-4 sm:p-6 w-full max-w-3xl relative shadow-lg mb-4">
                <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-200 p-1"><FaTimes className="w-5 h-5" /></button>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 pr-8">Add New Order</h2>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} required />
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Phone *" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <input className="p-2 rounded bg-gray-700 border border-gray-600" placeholder="Address *" value={address} onChange={e => setAddress(e.target.value)} required />
                </div>

                {/* Products */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Products</span>
                        <button onClick={addProduct} className="flex items-center gap-1 px-3 py-1 rounded bg-[var(--brand-blue)] hover:opacity-90 transition text-white"><FaPlus /> Add Product</button>
                    </div>

                    {loadingProducts ? (
                        <div className="text-center text-gray-400 py-4">Loading products...</div>
                    ) : ownerProducts.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">No products found. Please add products first.</div>
                    ) : (
                        products.map((p, i) => {
                            const selectedProduct = ownerProducts.find(prod => prod._id === p.product);
                            const hasVariants = selectedProduct?.variants && selectedProduct.variants.length > 0;
                            const hasColors = selectedProduct?.colors && selectedProduct.colors.length > 0;
                            const hasSizes = selectedProduct?.sizes && selectedProduct.sizes.length > 0;

                            return (
                                <div key={i} className="border border-gray-600 rounded-lg p-3 mb-3 bg-gray-750">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                                        {/* Product Select */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs text-gray-400 mb-1">Select Product *</label>
                                            <select 
                                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                                value={p.product || ''}
                                                onChange={(e) => handleProductSelect(i, e.target.value)}
                                            >
                                                <option value="">-- Select Product --</option>
                                                {ownerProducts.map(prod => (
                                                    <option key={prod._id} value={prod._id}>
                                                        {prod.name} - ${prod.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Quantity *</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-sm" 
                                                value={p.quantity} 
                                                onChange={e => updateProduct(i, 'quantity', Number(e.target.value) || 1)} 
                                            />
                                        </div>
                                    </div>

                                    {/* Color and Size Selection - Show if product has these options */}
                                    {p.product && (hasColors || hasSizes) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                            {/* Color Select */}
                                            {hasColors && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                                                    <select 
                                                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                                        value={p.color || ''}
                                                        onChange={(e) => updateProduct(i, 'color', e.target.value)}
                                                    >
                                                        <option value="">-- Select Color --</option>
                                                        {selectedProduct!.colors!.map(color => (
                                                            <option key={color} value={color}>
                                                                {color}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            
                                            {/* Size Select */}
                                            {hasSizes && (
                                                <div>
                                                    <label className="block text-xs text-gray-400 mb-1">Size</label>
                                                    <select 
                                                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                                        value={p.size || ''}
                                                        onChange={(e) => updateProduct(i, 'size', e.target.value)}
                                                    >
                                                        <option value="">-- Select Size --</option>
                                                        {selectedProduct!.sizes!.map(size => (
                                                            <option key={size} value={size}>
                                                                {size}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Variant Selection - Show only if product has variants */}
                                    {hasVariants && selectedProduct && (
                                        <div className="mb-2">
                                            <label className="block text-xs text-gray-400 mb-1">Select Variant (Optional)</label>
                                            <select 
                                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-sm"
                                                onChange={(e) => handleVariantSelect(i, Number(e.target.value))}
                                            >
                                                <option value="">-- Default (No Variant) --</option>
                                                {selectedProduct.variants!.map((variant, vIdx) => (
                                                    <option key={vIdx} value={vIdx}>
                                                        {variant.color && `Color: ${variant.color}`}
                                                        {variant.color && variant.size && ' | '}
                                                        {variant.size && `Size: ${variant.size}`}
                                                        {variant.price && ` - $${variant.price}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Display selected variant info */}
                                    {p.product && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-400">Color:</span>
                                                <span className="ml-1 text-gray-200">{p.color || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Size:</span>
                                                <span className="ml-1 text-gray-200">{p.size || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Price:</span>
                                                <span className="ml-1 text-gray-200">${p.price}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Subtotal:</span>
                                                <span className="ml-1 text-gray-200">${(p.price * p.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <div className="mt-2 flex justify-end">
                                        <button 
                                            onClick={() => removeProduct(i)} 
                                            className="text-red-500 hover:text-red-400 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition text-xs flex items-center gap-1"
                                        >
                                            <FaTrash className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Total & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <input type="text" className="p-2 rounded bg-gray-700 border border-gray-600 text-sm" placeholder="Total Amount (e.g., 199.99)" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value) || 0)} />
                    <select className="p-2 rounded bg-gray-700 border border-gray-600 text-sm" value={status} onChange={e => setStatus(e.target.value as IOrder['status'])}>
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition text-sm sm:text-base">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className={`px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white transition text-sm sm:text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? <span className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>Loading...</span> : 'Add Order'}</button>
                </div>
            </div>
        </div>
    );
}
