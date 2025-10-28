"use client"

import axiosInstance from "@/axios/axiosInstance"
import useCartStore from "@/zustand/cartPopup"
import { useProductFiltersStore } from "@/zustand/productsFiltrs"
import useUserStore from "@/zustand/user"
import useWishlistStore from "@/zustand/wishList"
import { Heart, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [zoomStyle, setZoomStyle] = useState({})
  const [isZooming, setIsZooming] = useState(false)
  const router = useRouter()

  const {
    categoryId,
    subCategoryId,
    subCategoryTwoId,
    brandId,
    categorySlug,
    subCategorySlug,
    subCategoryTwoSlug,
    brandSlug,
    setFilters,
    clearFilters,
    productID
  } = useProductFiltersStore();

  const [error, setError] = useState(null);
  const [stockError, setStockError] = useState(null);
  const setCartItemsCount = useCartStore((state) => state.setCurrentItems);
  const [cartItems, setCartItems] = useState([])
  const currentUser = useUserStore((state) => state.user);
  const [customerGroupsDiscounts, setCustomerGroupsDiscounts] = useState([])
  const [itemBasedDiscounts, setItemBasedDiscounts] = useState([])
  const [loading, setLoading] = useState(false)
  const setWishlistItemsCount = useWishlistStore((state) => state.setCurrentWishlistItems);
  const [wishListItems, setWishlistItems] = useState([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // RELATED PRODUCTS STATES
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false)
  const [relatedProductsQuantities, setRelatedProductsQuantities] = useState({})
  const [relatedProductsSelectedUnits, setRelatedProductsSelectedUnits] = useState({})
  const [relatedProductsStockErrors, setRelatedProductsStockErrors] = useState({})
  const [relatedProductsLoadingCart, setRelatedProductsLoadingCart] = useState({})
  const [relatedProductsLoadingWishlist, setRelatedProductsLoadingWishlist] = useState({})

  const [product, setProduct] = useState(null)

  window.addEventListener("popstate", function (event) {
    setFilters({
      categoryId,
      subCategoryId,
      subCategoryTwoId,
      brandId,
      categorySlug,
      subCategorySlug,
      subCategoryTwoSlug,
      brandSlug,
      productID: null
    });
  });

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setFilters({
        categoryId,
        subCategoryId,
        subCategoryTwoId,
        brandId,
        categorySlug,
        subCategorySlug,
        subCategoryTwoSlug,
        brandSlug,
        productID: null
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [categoryId, subCategoryId, subCategoryTwoId, brandId, categorySlug, subCategorySlug, subCategoryTwoSlug, brandSlug, setFilters]);

  // FIXED: Handle image structure properly
  const getProductImages = (product) => {
    if (!product) return [];

    if (Array.isArray(product.images)) {
      return product.images;
    } else if (typeof product.images === 'string' && product.images) {
      return [product.images];
    } else if (product.allImages && Array.isArray(product.allImages)) {
      return product.allImages;
    }
    return [];
  };

  // EXACT SAME DISCOUNT CALCULATION AS PRODUCT LISTING PAGE
  // FIXED: Calculate discounted price with proper pricing group lookup
  const calculateDiscountedPrice = (targetProduct = null) => {
    const productToUse = targetProduct || product;
    if (!productToUse || !productToUse.eachPrice) return 0;

    const originalPrice = productToUse.eachPrice;

    // Priority 1: If product has comparePrice (not null, not undefined, and not 0), use it
    if (productToUse.comparePrice !== null && productToUse.comparePrice !== undefined && productToUse.comparePrice !== 0) {
      console.log("Using compare price:", productToUse.comparePrice);
      return productToUse.comparePrice;
    }

    // If no comparePrice or comparePrice is 0, check for discounts
    if (!currentUser || !currentUser.customerId) {
      console.log("No user or customerId, returning original price");
      return originalPrice;
    }

    // Priority 2: Check for item-based discount
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === productToUse.sku && discount.customerId === currentUser.customerId
    );

    // If item-based discount exists, apply it
    if (itemDiscount) {
      console.log("Applying item-based discount:", itemDiscount.percentage);
      const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
      return Math.max(0, originalPrice - discountAmount);
    }

    // Priority 3: Check for pricing group discount - FIXED LOGIC
    if (productToUse.pricingGroup && customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
      const productPricingGroupId = typeof productToUse.pricingGroup === 'object'
        ? productToUse.pricingGroup._id
        : productToUse.pricingGroup;

      console.log("Looking for pricing group:", productPricingGroupId);
      console.log("Available pricing groups:", customerGroupsDiscounts);

      // Find the pricing group discount document that matches the product's pricing group
      const groupDiscountDoc = customerGroupsDiscounts.find(
        discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
      );

      if (groupDiscountDoc) {
        console.log("Found matching pricing group discount:", groupDiscountDoc);

        // Find the customer within that pricing group
        const customerDiscount = groupDiscountDoc.customers.find(
          customer => customer.user && customer.user.customerId === currentUser.customerId
        );

        if (customerDiscount) {
          console.log("Found customer discount:", customerDiscount);
          const percentage = parseFloat(customerDiscount.percentage);

          // Handle both positive and negative percentages
          if (percentage > 0) {
            // Positive percentage means price increase
            const newPrice = originalPrice + (originalPrice * percentage / 100);
            console.log(`Applying +${percentage}% price increase: ${originalPrice} -> ${newPrice}`);
            return newPrice;
          } else if (percentage < 0) {
            // Negative percentage means price decrease (discount)
            const discountAmount = (originalPrice * Math.abs(percentage)) / 100;
            const newPrice = Math.max(0, originalPrice - discountAmount);
            console.log(`Applying ${percentage}% discount: ${originalPrice} -> ${newPrice}`);
            return newPrice;
          }
        } else {
          console.log("No customer discount found for customerId:", currentUser.customerId);
        }
      } else {
        console.log("No matching pricing group found for product");
      }
    }

    console.log("No discounts applied, returning original price");
    return originalPrice;
  };

  // FIXED: Get discount percentage for display
  const getDiscountPercentage = (targetProduct = null) => {
    const productToUse = targetProduct || product;
    if (!productToUse) return null;

    // If product has comparePrice, show comparePrice discount
    if (productToUse.comparePrice !== null && productToUse.comparePrice !== undefined && productToUse.comparePrice !== 0) {
      const originalPrice = productToUse.eachPrice || 0;
      if (originalPrice > 0 && productToUse.comparePrice < originalPrice) {
        const discountAmount = originalPrice - productToUse.comparePrice;
        const discountPercentage = (discountAmount / originalPrice) * 100;
        return Math.round(discountPercentage);
      }
      return null;
    }

    if (!currentUser || !currentUser.customerId) {
      return null;
    }

    // Check item-based discount
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === productToUse.sku && discount.customerId === currentUser.customerId
    );

    if (itemDiscount) {
      return itemDiscount.percentage;
    }

    // Check pricing group discount - FIXED LOGIC
    if (productToUse.pricingGroup && customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
      const productPricingGroupId = typeof productToUse.pricingGroup === 'object'
        ? productToUse.pricingGroup._id
        : productToUse.pricingGroup;

      const groupDiscountDoc = customerGroupsDiscounts.find(
        discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
      );

      if (groupDiscountDoc) {
        const customerDiscount = groupDiscountDoc.customers.find(
          customer => customer.user && customer.user.customerId === currentUser.customerId
        );

        if (customerDiscount) {
          const percentageValue = parseFloat(customerDiscount.percentage);
          // For display purposes, we show the absolute value for negative percentages (discounts)
          // For positive percentages (price increases), we don't show a discount percentage
          if (percentageValue < 0) {
            return Math.abs(percentageValue);
          }
          // For positive percentages, return null as it's not a discount but a price increase
          return null;
        }
      }
    }

    return null;
  };

  // FIXED: Check if product has any discount or comparePrice
  const hasDiscount = (targetProduct = null) => {
    const productToUse = targetProduct || product;
    if (!productToUse) return false;

    // Check if product has comparePrice discount
    if (productToUse.comparePrice !== null && productToUse.comparePrice !== undefined && productToUse.comparePrice !== 0) {
      const originalPrice = productToUse.eachPrice || 0;
      if (productToUse.comparePrice < originalPrice) {
        return true;
      }
    }

    // Check if product has item-based discount
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === productToUse.sku && discount.customerId === currentUser?.customerId
    );
    if (itemDiscount && itemDiscount.percentage) {
      return true;
    }

    // Check if product has pricing group discount (negative percentage only)
    if (productToUse.pricingGroup && customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
      const productPricingGroupId = typeof productToUse.pricingGroup === 'object'
        ? productToUse.pricingGroup._id
        : productToUse.pricingGroup;

      const groupDiscountDoc = customerGroupsDiscounts.find(
        discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
      );

      if (groupDiscountDoc) {
        const customerDiscount = groupDiscountDoc.customers.find(
          customer => customer.user && customer.user.customerId === currentUser?.customerId
        );

        if (customerDiscount) {
          const percentageValue = parseFloat(customerDiscount.percentage);
          // Only return true for negative percentages (actual discounts)
          if (percentageValue < 0) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // RELATED PRODUCTS FUNCTIONS

  // Fetch related products based on current filters
  const fetchRelatedProducts = async () => {
    try {
      setRelatedProductsLoading(true);

      const queryParams = {
        limit: 4,
        sortBy: "createdAt",
        sortOrder: "desc"
      };

      // Use current filters to get related products
      if (brandId) queryParams.brandId = brandId;
      if (categoryId) queryParams.categoryId = categoryId;
      if (subCategoryId) queryParams.subCategoryId = subCategoryId;
      if (subCategoryTwoId) queryParams.subCategoryTwoId = subCategoryTwoId;

      console.log("Fetching related products with params:", queryParams);

      const response = await axiosInstance.get('products/get-products-by-filters', {
        params: queryParams
      });

      if (response.data.statusCode === 200) {
        let productsData = response.data.data.products || [];

        // Filter out the current product from related products
        productsData = productsData.filter(p => p._id !== productID);

        // Take only first 4 products
        productsData = productsData.slice(0, 4);

        setRelatedProducts(productsData);

        // Initialize quantities and selected units for related products
        const initialQuantities = {};
        const initialUnits = {};
        productsData.forEach(product => {
          initialQuantities[product._id] = 1;
          if (product.typesOfPacks && product.typesOfPacks.length > 0) {
            initialUnits[product._id] = product.typesOfPacks[0]._id;
          }
        });
        setRelatedProductsQuantities(initialQuantities);
        setRelatedProductsSelectedUnits(initialUnits);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setRelatedProductsLoading(false);
    }
  };

  // Check if related product is in wishlist
  const isRelatedProductInWishlist = (productId) => {
    return wishListItems.some(item => item.product?._id === productId);
  };

  // Check if related product is in cart
  const isRelatedProductInCart = (productId) => {
    return cartItems.some(item => item.product?._id === productId);
  };

  // Get cart item for related product
  const getRelatedCartItem = (productId) => {
    return cartItems.find(item => item.product?._id === productId);
  };

  // Calculate total quantity for related product
  const calculateRelatedTotalQuantity = (productId, packId = null, unitsQty = null) => {
    const product = relatedProducts.find(p => p._id === productId);
    if (!product) return 0;

    const packIdToUse = packId !== null ? packId : relatedProductsSelectedUnits[productId];
    const unitsToUse = unitsQty !== null ? unitsQty : (relatedProductsQuantities[productId] || 1);

    const selectedPack = product.typesOfPacks?.find(pack => pack._id === packIdToUse);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;

    return packQuantity * unitsToUse;
  };

  // Check stock for related product
  const checkRelatedStockLevel = (productId, packId = null, unitsQty = null) => {
    const product = relatedProducts.find(p => p._id === productId);
    if (!product) return { isValid: true };

    const totalRequestedQuantity = calculateRelatedTotalQuantity(productId, packId, unitsQty);
    const cartItem = getRelatedCartItem(productId);
    const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

    const newTotalQuantity = isRelatedProductInCart(productId)
      ? totalRequestedQuantity
      : totalRequestedQuantity + currentCartQuantity;

    const isValid = newTotalQuantity <= product.stockLevel;
    return {
      isValid,
      message: isValid ? null : `Exceeds available stock (${product.stockLevel})`,
      requestedQuantity: totalRequestedQuantity,
      currentStock: product.stockLevel
    };
  };

  // Handle related product quantity change
  const handleRelatedQuantityChange = (productId, change) => {
    const currentQuantity = relatedProductsQuantities[productId] || 1;
    const newQuantity = Math.max(1, currentQuantity + change);

    setRelatedProductsQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));

    const stockCheck = checkRelatedStockLevel(productId, null, newQuantity);
    if (!stockCheck.isValid) {
      setRelatedProductsStockErrors(prev => ({
        ...prev,
        [productId]: stockCheck.message
      }));
    } else {
      setRelatedProductsStockErrors(prev => ({
        ...prev,
        [productId]: null
      }));
    }
  };

  // Handle related product unit change
  const handleRelatedUnitChange = (productId, unitId, product) => {
    setRelatedProductsSelectedUnits(prev => ({
      ...prev,
      [productId]: unitId
    }));

    const currentQuantity = relatedProductsQuantities[productId] || 1;
    const stockCheck = checkRelatedStockLevel(productId, unitId, currentQuantity);

    if (!stockCheck.isValid) {
      setRelatedProductsStockErrors(prev => ({
        ...prev,
        [productId]: stockCheck.message
      }));
    } else {
      setRelatedProductsStockErrors(prev => ({
        ...prev,
        [productId]: null
      }));
    }
  };

  // Add related product to cart
  const handleRelatedAddToCart = async (productId) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to add items to cart");
      return;
    }

    const stockCheck = checkRelatedStockLevel(productId);
    if (!stockCheck.isValid) {
      setError(stockCheck.message);
      setRelatedProductsStockErrors(prev => ({
        ...prev,
        [productId]: stockCheck.message
      }));
      return;
    }

    setRelatedProductsLoadingCart(prev => ({ ...prev, [productId]: true }));

    try {
      const product = relatedProducts.find(p => p._id === productId);
      if (!product) return;

      const selectedPack = product.typesOfPacks?.find(pack => pack._id === relatedProductsSelectedUnits[productId]);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const unitsQuantity = relatedProductsQuantities[productId] || 1;
      const totalQuantity = packQuantity * unitsQuantity;

      // Calculate discounted price using the same logic as product listing
      const discountedPrice = calculateDiscountedPrice(product);
      const totalAmount = discountedPrice;

      console.log("add to cart total amount ", totalAmount)

      // Determine discount type and percentage using the same logic as product listing
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check if product has comparePrice
      if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
        const originalPrice = product.eachPrice || 0;
        const discountAmount = originalPrice - product.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "Compare Price";
      }
      // Priority 2: Check for item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "Item Based Discount";
        }
        // Priority 3: Check for pricing group discount
        else if (product.pricingGroup && customerGroupsDiscounts && customerGroupsDiscounts.length > 0) {
          const productPricingGroupId = typeof product.pricingGroup === 'object'
            ? product.pricingGroup._id
            : product.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user && customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              const percentageValue = parseFloat(customerDiscount.percentage);
              // For cart, we store the absolute value and indicate it's a pricing group discount
              // even for positive percentages (price increases)
              discountPercentages = Math.abs(percentageValue);
              discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";

              console.log(`Pricing group discount applied: ${percentageValue}%`);
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: productId,
        packQuentity: packQuantity,
        unitsQuantity: unitsQuantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each',
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setRelatedProductsStockErrors(prev => ({
          ...prev,
          [productId]: null
        }));
      }
    } catch (error) {
      console.error('Error adding related product to cart:', error);
    } finally {
      setRelatedProductsLoadingCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle related product wishlist
  const handleRelatedAddToWishList = async (productId) => {
    try {
      if (!currentUser || !currentUser._id) {
        setError("Please login to manage wishlist");
        return;
      }

      setRelatedProductsLoadingWishlist(prev => ({ ...prev, [productId]: true }));

      const response = await axiosInstance.post('wishlist/add-to-wishlist', {
        customerId: currentUser._id,
        productId: productId
      });

      if (response.data.statusCode === 200) {
        await fetchCustomersWishList();
        setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error managing related product in wishlist:', error);
      setError('Error managing wishlist');
    } finally {
      setRelatedProductsLoadingWishlist(prev => {
        const updated = { ...prev };
        updated[productId] = false;
        return updated;
      });
    }
  };

  // Handle related product click
  const handleRelatedProductClick = (productName, productID) => {
    setFilters({
      categorySlug: categorySlug,
      subCategorySlug: subCategorySlug || null,
      subCategoryTwoSlug: subCategoryTwoSlug || null,
      brandSlug: brandSlug || null,
      brandId: brandId || null,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      subCategoryTwoId: subCategoryTwoId || null,
      productID: productID
    });
    const productSlug = productName.replace(/\s+/g, '-').toLowerCase();
    router.push(`/${productSlug}`);
  };

  // EXISTING PRODUCT DETAIL FUNCTIONS

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    checkStock(newQuantity, selectedUnitId);
  }

  const decrementQuantity = () => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity);
    checkStock(newQuantity, selectedUnitId);
  }

  const nextImage = () => {
    const images = getProductImages(product);
    if (images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = getProductImages(product);
    if (images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)',
    })
    setIsZooming(true)
  }

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
    })
    setIsZooming(false)
  }

  const getPageTitle = () => {
    if (subCategoryTwoSlug) return subCategoryTwoSlug?.split('-').join(' ').toUpperCase();
    if (subCategorySlug) return `${subCategorySlug?.split('-').join(' ').toUpperCase()}/${product?.ProductName}`;
    if (categorySlug) return `${brandSlug?.split('-').join(' ').toUpperCase()}/${product?.ProductName}`;
    if (brandSlug) return brandSlug?.split('-').join(' ').toUpperCase();
    return "ALL PRODUCTS";
  };

  // Calculate total quantity based on pack quantity and units
  const calculateTotalQuantity = () => {
    if (!product) return 0;

    const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
    return packQuantity * quantity;
  };

  // Check stock level
  const checkStock = (qty = quantity, unitId = selectedUnitId) => {
    if (!product) return { isValid: true };

    const selectedPack = product.typesOfPacks?.find(pack => pack._id === unitId);
    const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
    const totalRequestedQuantity = packQuantity * qty;

    const cartItem = getCartItem();
    const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

    const newTotalQuantity = isProductInCart()
      ? totalRequestedQuantity
      : totalRequestedQuantity + currentCartQuantity;

    const isValid = newTotalQuantity <= product.stockLevel;

    if (!isValid) {
      setStockError(`Exceeds available stock (${product.stockLevel})`);
    } else {
      setStockError(null);
    }

    return {
      isValid,
      message: isValid ? null : `Exceeds available stock (${product.stockLevel})`,
      requestedQuantity: totalRequestedQuantity,
      currentStock: product.stockLevel
    };
  };

  const handleUnitChange = (unitId) => {
    setSelectedUnitId(unitId);
    checkStock(quantity, unitId);
  };

  const getCartItem = () => {
    return cartItems.find(item => item.product?._id === product?._id);
  };

  const isProductInCart = () => {
    return cartItems.some(item => item.product?._id === product?._id);
  };

  // Add to cart function with EXACT SAME discount logic as product listing
  const handleAddToCart = async () => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to add items to cart");
      return;
    }

    if (!product) return;

    // Final stock check before adding to cart
    const stockCheck = checkStock();
    if (!stockCheck.isValid) {
      setError(stockCheck.message);
      return;
    }

    setLoading(true);

    try {
      const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const totalQuantity = packQuantity * quantity;

      // Calculate the discounted price for this product using the same logic
      const currentDiscountedPrice = calculateDiscountedPrice(product);

      // Calculate total amount using the discounted price
      const totalAmount = currentDiscountedPrice;

      // Determine discount type and percentage using the same logic
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check if product has comparePrice
      if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
        const originalPrice = product.eachPrice || 0;
        const discountAmount = originalPrice - product.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "Compare Price";
      }
      // Priority 2: Check for item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "Item Based Discount";
        }
        // Priority 3: Check for pricing group discount
        else if (product.pricingGroup) {
          const productPricingGroupId = typeof product.pricingGroup === 'object'
            ? product.pricingGroup._id
            : product.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
              discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: product._id,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each',
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      console.log("Sending cart data with discounts:", cartData);

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Error adding product to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update cart function with EXACT SAME discount logic as product listing
  const handleUpdateCart = async () => {
    if (!currentUser || !currentUser._id || !product) return;

    setLoading(true);

    try {
      const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
      const packQuantity = selectedPack ? parseInt(selectedPack.quantity) : 1;
      const totalQuantity = packQuantity * quantity;

      const stockCheck = checkStock();
      if (!stockCheck.isValid) {
        setError(stockCheck.message);
        setLoading(false);
        return;
      }

      // Calculate the discounted price for this product using the same logic
      const currentDiscountedPrice = calculateDiscountedPrice(product);

      // Calculate total amount using the discounted price
      const totalAmount = totalQuantity * currentDiscountedPrice;

      // Determine discount type and percentage using the same logic
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check if product has comparePrice
      if (product.comparePrice !== null && product.comparePrice !== undefined && product.comparePrice !== 0) {
        const originalPrice = product.eachPrice || 0;
        const discountAmount = originalPrice - product.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "Compare Price";
      }
      // Priority 2: Check for item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === product.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "Item Based Discount";
        }
        // Priority 3: Check for pricing group discount
        else if (product.pricingGroup) {
          const productPricingGroupId = typeof product.pricingGroup === 'object'
            ? product.pricingGroup._id
            : product.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === productPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
              discountType = groupDiscountDoc.pricingGroup?.name || "Pricing Group Discount";
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: product._id,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: selectedPack ? selectedPack.name : 'Each',
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      console.log("Updating cart data with discounts:", cartData);

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Error updating cart');
    } finally {
      setLoading(false);
    }
  };

  // Fetch product by ID
  const fetchProductById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance(`products/get-product/${productID}`);

      console.log("response product details", response);

      if (response.data.statusCode === 200) {
        const productData = response.data.data;
        setProduct(productData);

        // Set default selected unit to the first available pack type
        if (productData.typesOfPacks && productData.typesOfPacks.length > 0) {
          setSelectedUnitId(productData.typesOfPacks[0]._id);
        }
      } else {
        setError(response.data.message || "Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("An error occurred while fetching product");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer's cart
  const fetchCustomersCart = async () => {
    try {
      if (!currentUser || !currentUser._id) return;

      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

      console.log("Cart items:", response.data.data);
      if (response.data.statusCode === 200) {
        setCartItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer cart:', error);
    }
  };

  // Fetch groups discount
  const fetchCustomersGroupsDiscounts = async () => {
    try {
      if (!currentUser || !currentUser.customerId) return;

      const response = await axiosInstance.get(`pricing-groups-discount/get-pricing-group-discounts-by-customer-id/${currentUser._id}`);

      console.log("Customer groups discounts:", response.data.data);

      if (response.data.statusCode === 200) {
        setCustomerGroupsDiscounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer groups discounts:', error);
    }
  };

  // Fetch item based discounts 
  const fetchItemBasedDiscounts = async () => {
    try {
      if (!currentUser || !currentUser.customerId) return;

      const response = await axiosInstance.get(`item-based-discount/get-items-based-discount-by-customer-id/${currentUser.customerId}`);

      console.log("customers item based discounts:", response.data.data);

      if (response.data.statusCode === 200) {
        setItemBasedDiscounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching item based discounts:', error);
    }
  };

  const handleAddToWishList = async (productId) => {
    try {
      if (!currentUser || !currentUser._id) {
        setError("Please login to manage wishlist")
        return
      }

      setWishlistLoading(true)

      const response = await axiosInstance.post('wishlist/add-to-wishlist', {
        customerId: currentUser._id,
        productId: productId
      })

      console.log("Wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        await fetchCustomersWishList()
        setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error managing product in wishlist:', error)
      setError('Error managing wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const fetchCustomersWishList = async () => {
    try {
      if (!currentUser || !currentUser._id) return

      const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

      console.log("customers wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        setWishlistItems(response.data.data || [])
        setWishlistItemsCount(response.data.data?.length || 0)
      }
    }
    catch (error) {
      console.error('Error fetching customer wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishListItems.some(item => item.product?._id === productId);
  };

  useEffect(() => {
    if (currentUser && currentUser.customerId) {
      fetchItemBasedDiscounts();
      fetchCustomersGroupsDiscounts();
    }
  }, [currentUser?.customerId]);

  useEffect(() => {
    if (currentUser) {
      fetchCustomersCart();
      fetchCustomersWishList();
    }
  }, [currentUser]);

  useEffect(() => {
    if (productID) {
      fetchProductById();
    }
  }, [productID]);

  useEffect(() => {
    if ((categoryId || subCategoryId || subCategoryTwoId || brandId) && productID) {
      fetchRelatedProducts();
    }
  }, [categoryId, subCategoryId, subCategoryTwoId, brandId, productID]);

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Product not found</p>
      </div>
    );
  }

  const isInCart = isProductInCart();
  const cartItem = getCartItem();
  const isOutOfStock = product.stockLevel <= 0;
  const selectedPack = product.typesOfPacks?.find(pack => pack._id === selectedUnitId);
  const totalRequestedQuantity = calculateTotalQuantity();
  const productImages = getProductImages(product);

  // Calculate prices for main product using the same logic as product listing
  const mainDiscountedPrice = calculateDiscountedPrice(product);
  const mainDiscountPercentage = getDiscountPercentage(product);
  const mainHasDiscount = hasDiscount(product);

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white justify-items-center pt-4 overflow-x-hidden">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <nav className="text-xs sm:text-sm lg:text-[1.2rem] text-gray-500 font-[400] font-spartan w-full">
            <span className="uppercase">Home</span>
            <span className="">/</span>
            <span className="hidden sm:inline">{getPageTitle()}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white justify-items-center">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 justify-items-center">
          <h1 className="text-lg sm:text-xl lg:text-[1.2rem] text-black font-[400] font-spartan pb-3 sm:pb-5">
            {product?.ProductName}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 ">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Product Images */}
          <div className="space-y-4 flex flex-col lg:flex-row lg:space-x-16 lg:space-y-0">
            {/* Thumbnail Images */}
            {productImages.length > 0 && (
              <div className="order-2 lg:order-1 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="flex-shrink-0 rounded-lg p-2 transition-all duration-300 ease-out hover:scale-[1.02] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-[80px] h-[60px] sm:w-[120px] sm:h-[90px] lg:w-[9.875rem] lg:h-[7.0625rem] object-contain rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative order-1 lg:order-2 w-full">
              <div className="rounded-lg bg-white relative overflow-hidden">
                {/* Badge */}
                {product.badge && (
                  <span
                    className="absolute top-2 left-2 z-10 text-white text-[11px] font-[600] font-spartan tracking-widest px-2 py-1 rounded-lg"
                    style={{ backgroundColor: product.badge.backgroundColor }}
                  >
                    {product.badge.text}
                  </span>
                )}

                {/* Navigation Buttons - Only show if multiple images */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-20"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 z-20"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                  </>
                )}

                <div className="relative">
                  <div className="rounded-lg bg-[#FAFAFA]">
                    <img
                      src={productImages[selectedImage] || "/placeholder.svg"}
                      alt={product.ProductName}
                      className="w-full h-[200px] sm:h-[300px] lg:h-[24.1875rem] object-contain"
                      style={zoomStyle}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-[17px] font-spartan xl:max-w-[360px] mt-5">
            {/* Header */}
            <div>
              <h1 className="text-lg sm:text-xl lg:text-[1.3rem] font-medium text-black ">
                {product.ProductName}
              </h1>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[13px] font-medium">SKU: {product.sku}</p>
                <span className={`text-[14px] ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-[#E7FAEF] text-black'} p-2 font-semibold font-spartan py-1 rounded`}>
                  {isOutOfStock ? '✗ OUT OF STOCK' : '✓ IN STOCK'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-[24px] font-semibold text-[#2D2C70]">
                ${mainDiscountedPrice.toFixed(2)}
              </span>
              {mainHasDiscount && product.eachPrice && mainDiscountedPrice < product.eachPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.eachPrice.toFixed(2)}
                </span>
              )}
              {mainDiscountPercentage && mainDiscountPercentage > 0 && (
                <span className="text-sm text-green-600 font-semibold">
                  ({mainDiscountPercentage}% OFF)
                </span>
              )}
            </div>

            {/* Stock Error Message */}
            {stockError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {stockError}
              </div>
            )}

            {/* Quantity & Units */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-[48px] space-y-4 sm:space-y-0">
              {/* Quantity */}
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-[400]">Quantity</span>
                <div className="flex items-center">
                  <button
                    className="p-1 px-2 bg-black rounded-md disabled:bg-gray-400"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="px-3 py-1 min-w-[2rem] text-center text-base font-medium">
                    {quantity}
                  </span>
                  <button
                    className="p-1 px-2 bg-black rounded-md disabled:bg-gray-400"
                    onClick={incrementQuantity}
                    disabled={isOutOfStock || totalRequestedQuantity >= product.stockLevel}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block bg-gray-300 w-[1px] h-14"></div>

              {/* Units */}
              <div className="flex flex-col space-y-2 min-w-[167px]">
                <span className="text-sm font-[400]">Units</span>
                <div className="relative w-full">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    disabled={isOutOfStock}
                    className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-sm 
                              focus:outline-none appearance-none disabled:bg-gray-100"
                  >
                    {product.typesOfPacks && product.typesOfPacks.length > 0 ? (
                      product.typesOfPacks.map((pack) => (
                        <option key={pack._id} value={pack._id}>
                          {pack.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No packs available</option>
                    )}
                  </select>

                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Row 1 */}
            <div className="space-y-[17px]">
              {/* Add to Cart and Wishlist Row - Only show when NOT in cart */}

              <div className="flex items-center space-x-5">
                <button
                  className="flex items-center border border-black text-white bg-[#46BCF9] xl:min-w-[360px] justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#46BCF9] rounded-lg text-white py-2 px-6 transition-colors duration-300 group disabled:bg-gray-400 disabled:border-gray-400"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading || !!stockError}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 transition-colors duration-300"
                        viewBox="0 0 21 21"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleAddToWishList(product._id)}
                  className="flex items-center justify-center rounded-full"
                  disabled={wishlistLoading}
                >
                  <div className="h-8 w-8 bg-[#D9D9D940] p-2 flex mt-3 items-center justify-center rounded-full transition-colors cursor-pointer">
                    {wishlistLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E9098D]"></div>
                    ) : isInWishlist(product._id) ? (
                      <Heart className="w-4 h-4" fill="#E9098D" stroke="#E9098D" />
                    ) : (
                      <Heart className="w-4 h-4" fill="none" stroke="#D9D9D9" />
                    )}
                  </div>
                </button>
              </div>

              {/* Added and Update Row - Only show when product is in cart */}
              {isInCart && (
                <div className="flex space-x-2 w-full">
                  <button
                    className="flex-1 text-xs sm:text-sm border disabled:bg-gray-400 bborder-[#2D2C70] text-white bg-[#2D2C70] font-semibold text-white  rounded-lg py-2 flex justify-center items-center"
                    disabled
                  >
                    Added <Check className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    className="flex-1 border border-black text-xs sm:text-sm bg-[#E799A9] font-semibold rounded-lg text-white py-2 flex justify-center disabled:bg-gray-400"
                    onClick={handleUpdateCart}
                    disabled={isOutOfStock || totalRequestedQuantity > product.stockLevel || loading || !!stockError}
                  >
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              )}

              {/* Cart Info */}
              {isInCart && cartItem && (
                <div className="text-sm sm:text-base font-medium text-black hover:text-[#E9098D]">
                  In Cart Quantity: {cartItem.unitsQuantity} ({cartItem.packType})
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-[15px]">
            <div className="font-spartan space-y-[15px]">
              <h3 className="text-[1rem] font-medium text-black">Details of the product:</h3>
              <div
                className="text-black text-[15px] font-[400]"
                dangerouslySetInnerHTML={{
                  __html: product.storeDescription || "<p>No description available.</p>",
                }}
              />
            </div>

            {/* Barcode */}
            <div className="text-[1rem] font-[400] text-black">
              <h4 className="text-black">Barcode</h4>
              <p className="">{product.eachBarcodes || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 min-w-[90vw] h-[1px] flex my-8 relative lg:right-34"></div>

        {/* People Also Bought Section */}
        <div className="space-y-8 lg:space-y-12 pb-18">
          <h2 className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-center text-[#2E2F7F]">
            Related Products
          </h2>

          {relatedProductsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((product) => {
                const isInCart = isRelatedProductInCart(product._id);
                const cartItem = getRelatedCartItem(product._id);
                const isInWishlist = isRelatedProductInWishlist(product._id);
                const isOutOfStock = product.stockLevel <= 0;
                const stockError = relatedProductsStockErrors[product._id];
                const isWishlistLoading = relatedProductsLoadingWishlist[product._id];
                const isCartLoading = relatedProductsLoadingCart[product._id];

                const discountedPrice = calculateDiscountedPrice(product);
                const discountPercentage = getDiscountPercentage(product);
                const hasProductDiscount = hasDiscount(product);
                const productImages = getProductImages(product);

                return (
                  <div key={product._id} className="bg-white rounded-lg p-4 border border-gray-200">
                    {/* Wishlist Icon */}
                    <div className="relative">
                      <button
                        onClick={() => handleRelatedAddToWishList(product._id)}
                        disabled={isWishlistLoading}
                        className="absolute top-2 right-2 z-10"
                      >
                        <div className="h-8 w-8 bg-[#D9D9D940] p-2 flex items-center justify-center rounded-full transition-colors cursor-pointer">
                          {isWishlistLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E9098D]"></div>
                          ) : (
                            <Heart
                              className="w-4 h-4"
                              fill={isInWishlist ? "#E9098D" : "none"}
                              stroke={isInWishlist ? "#E9098D" : "#D9D9D9"}
                            />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Product Image */}
                    <div
                      className="relative flex justify-center py-6 mb-4 border border-gray-200 rounded-xl cursor-pointer bg-gray-50"
                      onClick={() => handleRelatedProductClick(product.ProductName, product._id)}
                    >
                      <img
                        src={productImages[0] || "/placeholder.svg"}
                        alt={product.ProductName}
                        className="h-[10.0625rem] object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="font-spartan text-[14px] font-medium">
                      <h3
                        className="text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[#E9098D] cursor-pointer"
                        onClick={() => handleRelatedProductClick(product.ProductName, product._id)}
                      >
                        {product.ProductName}
                      </h3>
                      <p className="mb-2 text-xs text-gray-600">SKU: {product.sku}</p>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`flex items-center space-x-1 px-2 ${isOutOfStock ? 'bg-red-100' : 'bg-[#E7FAEF]'}`}>
                          <svg className={`w-3 h-3 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`text-xs font-semibold font-spartan py-1 rounded ${isOutOfStock ? 'text-red-600' : 'text-black'}`}>
                            {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-[#2D2C70] text-[16px] font-semibold">
                          ${discountedPrice.toFixed(2)}
                        </span>
                        {hasProductDiscount && product.eachPrice && discountedPrice < product.eachPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ${product.eachPrice.toFixed(2)}
                          </span>
                        )}
                        {discountPercentage && discountPercentage > 0 && (
                          <span className="text-xs text-green-600 font-semibold">
                            ({discountPercentage}% OFF)
                          </span>
                        )}
                      </div>

                      {/* Stock Error Message */}
                      {stockError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs mb-2">
                          {stockError}
                        </div>
                      )}

                      {/* Units Dropdown */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Units</label>
                        <div className="relative w-full">
                          <select
                            value={relatedProductsSelectedUnits[product._id] || ''}
                            onChange={(e) => handleRelatedUnitChange(product._id, e.target.value, product)}
                            disabled={isOutOfStock}
                            className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-xs 
                                    focus:outline-none focus:ring-1 focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                    appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            {product.typesOfPacks && product.typesOfPacks.length > 0 ? (
                              product.typesOfPacks.map((pack) => (
                                <option key={pack._id} value={pack._id}>
                                  {pack.name}
                                </option>
                              ))
                            ) : (
                              <option value="">No packs available</option>
                            )}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">Quantity</span>
                        <div className="flex items-center space-x-2">
                          <button
                            className="w-6 h-6 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={() => handleRelatedQuantityChange(product._id, -1)}
                            disabled={(relatedProductsQuantities[product._id] || 1) <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium min-w-[1.5rem] text-center">
                            {relatedProductsQuantities[product._id] || 1}
                          </span>
                          <button
                            className="w-6 h-6 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={() => handleRelatedQuantityChange(product._id, 1)}
                            disabled={isOutOfStock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Add to Cart Button - Show when NOT in cart */}

                      <button
                        className={`flex w-full items-center justify-center gap-2 text-sm font-semibold border rounded-lg py-2 transition-colors duration-300 ${isOutOfStock || isCartLoading || stockError
                          ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                          : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]'
                          }`}
                        onClick={() => handleRelatedAddToCart(product._id)}
                        disabled={isOutOfStock || isCartLoading || !!stockError}
                      >
                        {isCartLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 21 21" fill="currentColor">
                              <path d="M2.14062 14V2H0.140625V0H3.14062C3.69291 0 4.14062 0.44772 4.14062 1V13H16.579L18.579 5H6.14062V3H19.8598C20.4121 3 20.8598 3.44772 20.8598 4C20.8598 4.08176 20.8498 4.16322 20.8299 4.24254L18.3299 14.2425C18.2187 14.6877 17.8187 15 17.3598 15H3.14062C2.58835 15 2.14062 14.5523 2.14062 14ZM4.14062 21C3.03606 21 2.14062 20.1046 2.14062 19C2.14062 17.8954 3.03606 17 4.14062 17C5.24519 17 6.14062 17.8954 6.14062 19C6.14062 20.1046 5.24519 21 4.14062 21ZM16.1406 21C15.036 21 14.1406 20.1046 14.1406 19C14.1406 17.8954 15.036 17 16.1406 17C17.2452 17 18.1406 17.8954 18.1406 19C18.1406 20.1046 17.2452 21 16.1406 21Z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>

                      {/* Action Buttons Row - Only show when product is in cart */}
                      {isInCart && (
                        <div className="flex space-x-2 mt-1">
                          <button
                            className="flex-1 space-x-1 border border-[#2D2C70] text-white bg-[#2D2C70] rounded-lg py-2 text-xs font-medium transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled
                          >
                            <span>Added</span>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="w-px bg-gray-300 h-6 my-auto"></div>
                          <button
                            className={`flex-1 border rounded-lg py-2 text-xs font-medium transition-colors ${isOutOfStock || isCartLoading || stockError
                              ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                              : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999]'
                              }`}
                            onClick={() => handleRelatedAddToCart(product._id)}
                            disabled={isOutOfStock || isCartLoading || !!stockError}
                          >
                            {isCartLoading ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      )}

                      {/* Cart Quantity Info */}
                      {isInCart && cartItem && (
                        <div className="mt-2 text-xs font-medium text-black hover:text-[#E9098D] text-start">
                          In Cart: {cartItem.unitsQuantity} ({cartItem.packType})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!relatedProductsLoading && relatedProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}