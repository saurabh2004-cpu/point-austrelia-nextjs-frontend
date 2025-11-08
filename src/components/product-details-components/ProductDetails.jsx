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
import Notification from "../Notification"

function ProductDetail() {
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
    productID,
    productGroupId
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
  const currentCartItems = useCartStore((state) => state.currentItems)

  // State to track if we're showing a product or product group
  const [itemType, setItemType] = useState(null) // 'product' or 'productGroup'
  const [product, setProduct] = useState(null)
  const [productGroup, setProductGroup] = useState(null)

  // RELATED ITEMS STATES
  const [relatedItems, setRelatedItems] = useState([])
  const [relatedItemsLoading, setRelatedItemsLoading] = useState(false)
  const [relatedItemsQuantities, setRelatedItemsQuantities] = useState({})
  const [relatedItemsSelectedUnits, setRelatedItemsSelectedUnits] = useState({})
  const [relatedItemsStockErrors, setRelatedItemsStockErrors] = useState({})
  const [relatedItemsLoadingCart, setRelatedItemsLoadingCart] = useState({})
  const [relatedItemsLoadingWishlist, setRelatedItemsLoadingWishlist] = useState({})

  // Add this with your other state declarations
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success' // 'success' or 'error'
  });

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Determine if we're viewing a product or product group
  useEffect(() => {
    if (productID) {
      setItemType('product');
      fetchProductById();
    } else if (productGroupId) {
      setItemType('productGroup');
      fetchProductGroupById();
    }
  }, [productID, productGroupId]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchCustomersCart();
    }
  }, [currentUser, currentCartItems]);

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
      productID: null,
      productGroupId: null
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
        productID: null,
        productGroupId: null
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [categoryId, subCategoryId, subCategoryTwoId, brandId, categorySlug, subCategorySlug, subCategoryTwoSlug, brandSlug, setFilters]);


  // FIXED: Handle image structure properly for both products and product groups
  const getItemImages = (item) => {
    if (!item) return [];

    try {
      if (itemType === 'product') {
        // Handle product images
        if (Array.isArray(item.images) && item.images.length > 0) {
          return item.images.filter(img => img && img.trim() !== '');
        } else if (typeof item.images === 'string' && item.images.trim() !== '') {
          return [item.images];
        } else if (Array.isArray(item.allImages) && item.allImages.length > 0) {
          return item.allImages.filter(img => img && img.trim() !== '');
        }
        return []; // No images for product

      } else if (itemType === 'productGroup') {
        // For product groups, combine thumbnail and images array
        const allImages = [];

        // Add thumbnail as the first image (sku_1)
        if (item.thumbnailUrl && item.thumbnailUrl.trim() !== '') {
          allImages.push(item.thumbnailUrl);
        }

        // Add additional images from images array (sku_2, sku_3, etc.)
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach(image => {
            if (image && image.trim() !== '') {
              allImages.push(image);
            }
          });
        }

        // console.log("Product group images for", item.name, ":", {
        //   thumbnail: item.thumbnail,
        //   additionalImages: item.images,
        //   totalImages: allImages.length
        // });

        return allImages;
      }
    } catch (error) {
      console.error("Error getting item images:", error);
    }

    return [];
  };

  // Get current item (product or product group)
  const getCurrentItem = () => {
    return itemType === 'product' ? product : productGroup;
  };

  const debugImages = () => {
    const item = getCurrentItem();
    if (!item) return;

    // console.log("=== IMAGE DEBUG INFO ===");
    // console.log("Item Type:", itemType);
    // console.log("Item:", item);
    // console.log("Thumbnail:", item.thumbnail);
    // console.log("Images Array:", item.images);
    // console.log("getItemImages result:", getItemImages(item));
    // console.log("=== END DEBUG INFO ===");
  };

  // Call this in your useEffect when item loads
  useEffect(() => {
    if (getCurrentItem()) {
      debugImages();
    }
  }, [product, productGroup]);

  // Get item name
  const getItemName = () => {
    const item = getCurrentItem();
    if (!item) return '';
    return itemType === 'product' ? item.ProductName : item.name;
  };

  // Get item SKU
  const getItemSku = () => {
    const item = getCurrentItem();
    if (!item) return '';
    return item.sku;
  };

  // Get item description
  const getItemDescription = () => {
    const item = getCurrentItem();
    if (!item) return '';
    return item.storeDescription || "<p>No description available.</p>";
  };

  // Get item barcode
  const getItemBarcode = () => {
    const item = getCurrentItem();
    if (!item) return 'N/A';
    return itemType === 'product' ? (item.eachBarcodes || "N/A") : (item.eachBarcodes || "N/A");
  };

  // Check if item is out of stock
  const isItemOutOfStock = () => {
    const item = getCurrentItem();
    if (!item) return true;

    if (itemType === 'product') {
      return item.stockLevel <= 0;
    } else if (itemType === 'productGroup') {
      // For product groups, check if any product in the group is out of stock
      return item.products && item.products.some(product => product.stockLevel <= 0);
    }
    return true;
  };

  // Get stock level for display
  const getStockLevel = () => {
    const item = getCurrentItem();
    if (!item) return 0;

    if (itemType === 'product') {
      return item.stockLevel;
    } else if (itemType === 'productGroup') {
      // For product groups, return the minimum stock level among products
      if (item.products && item.products.length > 0) {
        return Math.min(...item.products.map(p => p.stockLevel || 0));
      }
      return 0;
    }
    return 0;
  };

  // EXACT SAME DISCOUNT CALCULATION AS PRODUCT LISTING PAGE
  const calculateDiscountedPrice = (targetItem = null) => {
    const itemToUse = targetItem || getCurrentItem();
    if (!itemToUse) return 0;

    const originalPrice = itemToUse.eachPrice || 0;

    // Priority 1: If item has comparePrice (not null, not undefined, and not 0), use it
    if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
      return itemToUse.comparePrice;
    }

    // If no comparePrice or comparePrice is 0, check for discounts
    if (!currentUser || !currentUser.customerId) {
      return originalPrice;
    }

    // Priority 2: Check for item-based discount
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === itemToUse.sku && discount.customerId === currentUser.customerId
    );

    // If item-based discount exists, apply it
    if (itemDiscount) {
      const discountAmount = (originalPrice * itemDiscount.percentage) / 100;
      return Math.max(0, originalPrice - discountAmount);
    }

    // Priority 3: Check for pricing group discount
    if (itemToUse.pricingGroup) {
      const itemPricingGroupId = typeof itemToUse.pricingGroup === 'object'
        ? itemToUse.pricingGroup._id
        : itemToUse.pricingGroup;

      // Find matching pricing group discount for this customer
      const groupDiscountDoc = customerGroupsDiscounts.find(
        discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
      );

      if (groupDiscountDoc) {
        const customerDiscount = groupDiscountDoc.customers.find(
          customer => customer.user && customer.user.customerId === currentUser.customerId
        );

        if (customerDiscount) {
          const percentage = parseFloat(customerDiscount.percentage);
          // Handle both positive and negative percentages
          if (percentage > 0) {
            // Positive percentage means price increase
            return originalPrice + (originalPrice * percentage / 100);
          } else {
            // Negative percentage means price decrease
            return originalPrice - (originalPrice * Math.abs(percentage) / 100);
          }
        }
      }
    }

    // If no discounts apply, return original price
    return originalPrice;
  };

  // FIXED: Get discount percentage for display
  const getDiscountPercentage = (targetItem = null) => {
    const itemToUse = targetItem || getCurrentItem();
    if (!itemToUse) return null;

    // If item has comparePrice, show comparePrice discount
    if (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) {
      const originalPrice = itemToUse.eachPrice || 0;
      const discountAmount = originalPrice - itemToUse.comparePrice;
      const discountPercentage = (discountAmount / originalPrice) * 100;
      return Math.round(discountPercentage);
    }

    if (!currentUser || !currentUser.customerId) {
      return null;
    }

    // Check item-based discount
    const itemDiscount = itemBasedDiscounts.find(
      discount => discount.productSku === itemToUse.sku && discount.customerId === currentUser.customerId
    );

    if (itemDiscount) {
      return itemDiscount.percentage;
    }

    // Check pricing group discount
    if (itemToUse.pricingGroup) {
      const itemPricingGroupId = typeof itemToUse.pricingGroup === 'object'
        ? itemToUse.pricingGroup._id
        : itemToUse.pricingGroup;

      const groupDiscountDoc = customerGroupsDiscounts.find(
        discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
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
          return null;
        }
      }
    }

    return null;
  };

  // FIXED: Check if item has any discount or comparePrice
  const hasDiscount = (targetItem = null) => {
    const itemToUse = targetItem || getCurrentItem();
    if (!itemToUse) return false;

    return (itemToUse.comparePrice !== null && itemToUse.comparePrice !== undefined && itemToUse.comparePrice !== 0) ||
      getDiscountPercentage(itemToUse) !== null;
  };

  // RELATED ITEMS FUNCTIONS

  // Fetch related items based on current filters
  const fetchRelatedItems = async () => {
    try {
      setRelatedItemsLoading(true);

      const queryParams = {
        limit: 4,
        sortBy: "createdAt",
        sortOrder: "desc"
      };

      // Use current filters to get related items
      if (brandId) queryParams.brandId = brandId;
      if (categoryId) queryParams.categoryId = categoryId;
      if (subCategoryId) queryParams.subCategoryId = subCategoryId;
      if (subCategoryTwoId) queryParams.subCategoryTwoId = subCategoryTwoId;

      // console.log("Fetching related items with params:", queryParams);

      // Fetch both products and product groups
      const [productsResponse, productGroupsResponse] = await Promise.all([
        axiosInstance.get('products/get-products-by-filters', { params: queryParams }),
        axiosInstance.get('product-group/get-product-groups-by-filters', { params: queryParams })
      ]);

      // console.log("products groups response", productGroupsResponse)

      let productsData = [];
      let productGroupsData = [];

      if (productsResponse.data.statusCode === 200) {
        productsData = productsResponse.data.data.products || [];
      }

      if (productGroupsResponse.data.statusCode === 200) {
        productGroupsData = productGroupsResponse.data.data.productGroups || [];
      }

      // Combine and filter out current item
      let combinedItems = [
        ...productsData.map(item => ({ ...item, type: 'product' })),
        ...productGroupsData.map(item => ({ ...item, type: 'productGroup' }))
      ];

      // Filter out current item
      combinedItems = combinedItems.filter(item => {
        if (itemType === 'product') {
          return item.type === 'productGroup' || item._id !== productID;
        } else {
          return item.type === 'product' || item._id !== productGroupId;
        }
      });

      // Take only first 4 items
      combinedItems = combinedItems.slice(0, 4);

      setRelatedItems(combinedItems);

      // Initialize quantities and selected units for related items
      const initialQuantities = {};
      const initialUnits = {};
      combinedItems.forEach(item => {
        initialQuantities[item._id] = 1;
        if (item.type === 'product' && item.typesOfPacks && item.typesOfPacks.length > 0) {
          initialUnits[item._id] = item.typesOfPacks[0]._id;
        }
      });
      setRelatedItemsQuantities(initialQuantities);
      setRelatedItemsSelectedUnits(initialUnits);
    } catch (error) {
      console.error('Error fetching related items:', error);
    } finally {
      setRelatedItemsLoading(false);
    }
  };

  // Check if related item is in wishlist
  const isRelatedItemInWishlist = (itemId, isProductGroup = false) => {

    if (!wishListItems || !Array.isArray(wishListItems)) {
      return false;
    }

    return wishListItems.some(item => {
      if (isProductGroup) {
        return item.productGroup?._id === itemId;
      } else {
        return item.product?._id === itemId;
      }
    });
  };

  // Check if related item is in cart
  const isRelatedItemInCart = (itemId, isProductGroup = false) => {

    if (!cartItems || !Array.isArray(cartItems)) {
      return false;
    }

    return cartItems.some(item => {
      if (isProductGroup) {
        return item.productGroup?._id === itemId;
      } else {
        return item.product?._id === itemId;
      }
    });
  };

  // Get cart item for related item
  const getRelatedCartItem = (itemId, isProductGroup = false) => {
    if (!cartItems || !Array.isArray(cartItems)) {
      return false;
    }

    return cartItems.find(item => {
      if (isProductGroup) {
        return item.productGroup?._id === itemId;
      } else {
        return item.product?._id === itemId;
      }
    });
  };

  // Calculate total quantity for related item
  const calculateRelatedTotalQuantity = (itemId, isProductGroup = false, packId = null, unitsQty = null) => {
    const item = relatedItems.find(i => i._id === itemId);
    if (!item) return 0;

    const packIdToUse = packId !== null ? packId : relatedItemsSelectedUnits[itemId];
    const unitsToUse = unitsQty !== null ? unitsQty : (relatedItemsQuantities[itemId] || 1);

    // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
    const packQuantity = isProductGroup ? 1 :
      (item.typesOfPacks?.find(pack => pack._id === packIdToUse) ? parseInt(item.typesOfPacks.find(pack => pack._id === packIdToUse).quantity) : 1);

    return packQuantity * unitsToUse;
  };

  // Check stock for related item
  const checkRelatedStockLevel = (itemId, isProductGroup = false, packId = null, unitsQty = null) => {
    const item = relatedItems.find(i => i._id === itemId);
    if (!item) return { isValid: true };

    let stockLevel;
    if (isProductGroup) {
      // For product groups, calculate stock level based on products in the group
      stockLevel = item.products && item.products.length > 0
        ? Math.min(...item.products.map(p => p.stockLevel || 0))
        : 0;
    } else {
      stockLevel = item.stockLevel;
    }

    const totalRequestedQuantity = calculateRelatedTotalQuantity(itemId, isProductGroup, packId, unitsQty);
    const cartItem = getRelatedCartItem(itemId, isProductGroup);
    const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

    const newTotalQuantity = isRelatedItemInCart(itemId, isProductGroup)
      ? totalRequestedQuantity
      : totalRequestedQuantity + currentCartQuantity;

    const isValid = newTotalQuantity <= stockLevel;
    return {
      isValid,
      message: isValid ? null : `Exceeds available stock (${stockLevel})`,
      requestedQuantity: totalRequestedQuantity,
      currentStock: stockLevel
    };
  };

  // Handle related item quantity change
  const handleRelatedQuantityChange = (itemId, change, isProductGroup = false) => {
    const currentQuantity = relatedItemsQuantities[itemId] || 1;
    const newQuantity = Math.max(1, currentQuantity + change);

    setRelatedItemsQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));

    const stockCheck = checkRelatedStockLevel(itemId, isProductGroup, null, newQuantity);
    if (!stockCheck.isValid) {
      setRelatedItemsStockErrors(prev => ({
        ...prev,
        [itemId]: stockCheck.message
      }));
    } else {
      setRelatedItemsStockErrors(prev => ({
        ...prev,
        [itemId]: null
      }));
    }
  };

  // Handle related item unit change (only for products)
  const handleRelatedUnitChange = (itemId, unitId, item) => {
    setRelatedItemsSelectedUnits(prev => ({
      ...prev,
      [itemId]: unitId
    }));

    const currentQuantity = relatedItemsQuantities[itemId] || 1;
    const stockCheck = checkRelatedStockLevel(itemId, false, unitId, currentQuantity);

    if (!stockCheck.isValid) {
      setRelatedItemsStockErrors(prev => ({
        ...prev,
        [itemId]: stockCheck.message
      }));
    } else {
      setRelatedItemsStockErrors(prev => ({
        ...prev,
        [itemId]: null
      }));
    }
  };

  // Add related item to cart
  const handleRelatedAddToCart = async (itemId, isProductGroup = false) => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to add items to cart");
      showNotification("Please login to add items to cart", "error");
      return;
    }

    const stockCheck = checkRelatedStockLevel(itemId, isProductGroup);
    if (!stockCheck.isValid) {
      setError(stockCheck.message);
      setRelatedItemsStockErrors(prev => ({
        ...prev,
        [itemId]: stockCheck.message
      }));
      showNotification(stockCheck.message, "error");
      return;
    }

    setRelatedItemsLoadingCart(prev => ({ ...prev, [itemId]: true }));

    try {
      const item = relatedItems.find(i => i._id === itemId);
      if (!item) return;

      // For product groups, we don't have typesOfPacks, so use default values
      const packQuantity = isProductGroup ? 1 :
        (item.typesOfPacks?.find(pack => pack._id === relatedItemsSelectedUnits[itemId]) ?
          parseInt(item.typesOfPacks.find(pack => pack._id === relatedItemsSelectedUnits[itemId]).quantity) : 1);

      const unitsQuantity = relatedItemsQuantities[itemId] || 1;
      const totalQuantity = packQuantity * unitsQuantity;

      // Calculate the discounted price for this item
      const discountedPrice = calculateDiscountedPrice(item);

      // Calculate total amount using the discounted price
      const totalAmount = discountedPrice;

      // Determine discount type and percentage
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check comparePrice discount
      if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
        const originalPrice = isProductGroup ? item.eachPrice : item.eachPrice;
        const discountAmount = originalPrice - item.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "compare_price";
      }
      // Priority 2: Check item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "item_based";
        }
        // Priority 3: Check pricing group discount
        else if (item.pricingGroup) {
          const itemPricingGroupId = typeof item.pricingGroup === 'object'
            ? item.pricingGroup._id
            : item.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user && customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
              discountType = "pricing_group";
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: isProductGroup ? null : itemId,
        productGroupId: isProductGroup ? itemId : null,
        packQuentity: packQuantity,
        unitsQuantity: unitsQuantity,
        totalQuantity: totalQuantity,
        packType: isProductGroup ? 'Each' : (item.typesOfPacks?.find(pack => pack._id === relatedItemsSelectedUnits[itemId]) ?
          item.typesOfPacks.find(pack => pack._id === relatedItemsSelectedUnits[itemId]).name : 'Each'),
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setRelatedItemsStockErrors(prev => ({
          ...prev,
          [itemId]: null
        }));

        // Show success notification for related item
        const action = isRelatedItemInCart(itemId, isProductGroup) ? "updated in" : "added to";
        const itemName = isProductGroup ? item.name : item.ProductName;
        showNotification(`${itemName} ${action} cart successfully!`);
      }
    } catch (error) {
      console.error('Error adding related item to cart:', error);
      showNotification("Failed to add item to cart", "error");
    } finally {
      setRelatedItemsLoadingCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle related item wishlist
  const handleRelatedAddToWishList = async (itemId, isProductGroup = false) => {
    try {
      if (!currentUser || !currentUser._id) {
        setError("Please login to manage wishlist");
        showNotification("Please login to manage wishlist", "error");
        return;
      }

      setRelatedItemsLoadingWishlist(prev => ({ ...prev, [itemId]: true }));

      const response = await axiosInstance.post('wishlist/add-to-wishlist', {
        customerId: currentUser._id,
        productId: isProductGroup ? null : itemId,
        productGroupId: isProductGroup ? itemId : null
      });

      if (response.data.statusCode === 200) {
        await fetchCustomersWishList();
        setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);

        // Show wishlist notification for related item
        const item = relatedItems.find(i => i._id === itemId);
        const itemName = isProductGroup ? item?.name : item?.ProductName;
        const action = isRelatedItemInWishlist(itemId, isProductGroup) ? "removed from" : "added to";
        showNotification(`${itemName} ${action} wishlist!`);
      }
    } catch (error) {
      console.error('Error managing related item in wishlist:', error);
      setError('Error managing wishlist');
      showNotification("Error managing wishlist", "error");
    } finally {
      setRelatedItemsLoadingWishlist(prev => {
        const updated = { ...prev };
        updated[itemId] = false;
        return updated;
      });
    }
  };

  // Handle related item click
  const handleRelatedItemClick = (itemName, itemId, isProductGroup = false) => {
    setFilters({
      categorySlug: categorySlug,
      subCategorySlug: subCategorySlug || null,
      subCategoryTwoSlug: subCategoryTwoSlug || null,
      brandSlug: brandSlug || null,
      brandId: brandId || null,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      subCategoryTwoId: subCategoryTwoId || null,
      productID: isProductGroup ? null : itemId,
      productGroupId: isProductGroup ? itemId : null
    });
    const itemSlug = itemName.replace(/\s+/g, '-').toLowerCase();
    router.push(`/${itemSlug}`);
  };

  // EXISTING PRODUCT DETAIL FUNCTIONS (Updated for both types)

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
    const images = getItemImages(getCurrentItem());
    if (images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    const images = getItemImages(getCurrentItem());
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
    if (subCategorySlug) return `${subCategorySlug?.split('-').join(' ').toUpperCase()}/${getItemName()}`;
    if (categorySlug) return `${brandSlug?.split('-').join(' ').toUpperCase()}/${getItemName()}`;
    if (brandSlug) return brandSlug?.split('-').join(' ').toUpperCase();
    return "ALL PRODUCTS";
  };

  // Calculate total quantity based on pack quantity and units
  const calculateTotalQuantity = () => {
    const item = getCurrentItem();
    if (!item) return 0;

    // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
    const packQuantity = itemType === 'productGroup' ? 1 :
      (item.typesOfPacks?.find(pack => pack._id === selectedUnitId) ?
        parseInt(item.typesOfPacks.find(pack => pack._id === selectedUnitId).quantity) : 1);

    return packQuantity * quantity;
  };

  // Check stock level
  const checkStock = (qty = quantity, unitId = selectedUnitId) => {
    const item = getCurrentItem();
    if (!item) return { isValid: true };

    // For product groups, we don't have typesOfPacks, so use default pack quantity of 1
    const packQuantity = itemType === 'productGroup' ? 1 :
      (item.typesOfPacks?.find(pack => pack._id === unitId) ?
        parseInt(item.typesOfPacks.find(pack => pack._id === unitId).quantity) : 1);

    const totalRequestedQuantity = packQuantity * qty;

    const cartItem = getCartItem();
    const currentCartQuantity = cartItem ? cartItem.totalQuantity : 0;

    const newTotalQuantity = isItemInCart()
      ? totalRequestedQuantity
      : totalRequestedQuantity + currentCartQuantity;

    const stockLevel = getStockLevel();
    const isValid = newTotalQuantity <= stockLevel;

    if (!isValid) {
      setStockError(`Exceeds available stock (${stockLevel})`);
    } else {
      setStockError(null);
    }

    return {
      isValid,
      message: isValid ? null : `Exceeds available stock (${stockLevel})`,
      requestedQuantity: totalRequestedQuantity,
      currentStock: stockLevel
    };
  };

  const handleUnitChange = (unitId) => {
    setSelectedUnitId(unitId);
    checkStock(quantity, unitId);
  };

  const getCartItem = () => {
    const item = getCurrentItem();
    if (!item) return null;

    if (!cartItems || !Array.isArray(cartItems)) {
      return false;
    }

    if (itemType === 'product') {
      return cartItems.find(cartItem => cartItem.product?._id === item._id);
    } else {
      return cartItems.find(cartItem => cartItem.productGroup?._id === item._id);
    }
  };

  const isItemInCart = () => {
    const item = getCurrentItem();
    if (!item) return false;



    if (itemType === 'product') {

      if (!cartItems || !Array.isArray(cartItems)) {
        return false;
      }

      return cartItems.some(cartItem => cartItem.product?._id === item._id);
    } else {

      if (!cartItems || !Array.isArray(cartItems)) {
        return false;
      }

      return cartItems.some(cartItem => cartItem.productGroup?._id === item._id);
    }
  };

  // Add to cart function for both products and product groups
  const handleAddToCart = async () => {
    if (!currentUser || !currentUser._id) {
      setError("Please login to add items to cart");
      showNotification("Please login to add items to cart", "error");
      return;
    }

    const item = getCurrentItem();
    if (!item) return;

    // Final stock check before adding to cart
    const stockCheck = checkStock();
    if (!stockCheck.isValid) {
      setError(stockCheck.message);
      showNotification(stockCheck.message, "error");
      return;
    }

    setLoading(true);

    try {
      // For product groups, we don't have typesOfPacks, so use default values
      const packQuantity = itemType === 'productGroup' ? 1 :
        (item.typesOfPacks?.find(pack => pack._id === selectedUnitId) ?
          parseInt(item.typesOfPacks.find(pack => pack._id === selectedUnitId).quantity) : 1);

      const totalQuantity = packQuantity * quantity;

      // Calculate the discounted price for this item
      const currentDiscountedPrice = calculateDiscountedPrice(item);

      // Calculate total amount using the discounted price
      const totalAmount = currentDiscountedPrice;

      // Determine discount type and percentage
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check if item has comparePrice
      if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
        const originalPrice = item.eachPrice || 0;
        const discountAmount = originalPrice - item.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "compare_price";
      }
      // Priority 2: Check for item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "item_based";
        }
        // Priority 3: Check for pricing group discount
        else if (item.pricingGroup) {
          const itemPricingGroupId = typeof item.pricingGroup === 'object'
            ? item.pricingGroup._id
            : item.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user && customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
              discountType = "pricing_group";
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: itemType === 'product' ? item._id : null,
        productGroupId: itemType === 'productGroup' ? item._id : null,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: itemType === 'productGroup' ? 'Each' : (item.typesOfPacks?.find(pack => pack._id === selectedUnitId) ?
          item.typesOfPacks.find(pack => pack._id === selectedUnitId).name : 'Each'),
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      // console.log("Sending cart data:", cartData);

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);

        // Show success notification
        const action = isItemInCart() ? "updated in" : "added to";
        showNotification(`${getItemName()} ${action} cart successfully!`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Error adding item to cart');
      showNotification("Failed to add item to cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update cart function
  const handleUpdateCart = async () => {
    if (!currentUser || !currentUser._id) {
      showNotification("Please login to update cart", "error");
      return;
    }

    const item = getCurrentItem();
    if (!item) return;

    setLoading(true);

    try {
      // For product groups, we don't have typesOfPacks, so use default values
      const packQuantity = itemType === 'productGroup' ? 1 :
        (item.typesOfPacks?.find(pack => pack._id === selectedUnitId) ?
          parseInt(item.typesOfPacks.find(pack => pack._id === selectedUnitId).quantity) : 1);

      const totalQuantity = packQuantity * quantity;

      const stockCheck = checkStock();
      if (!stockCheck.isValid) {
        setError(stockCheck.message);
        setLoading(false);
        return;
      }

      // Calculate the discounted price for this item
      const currentDiscountedPrice = calculateDiscountedPrice(item);

      // Calculate total amount using the discounted price
      const totalAmount = currentDiscountedPrice;

      // Determine discount type and percentage
      let discountType = "";
      let discountPercentages = 0;

      // Priority 1: Check if item has comparePrice
      if (item.comparePrice !== null && item.comparePrice !== undefined && item.comparePrice !== 0) {
        const originalPrice = item.eachPrice || 0;
        const discountAmount = originalPrice - item.comparePrice;
        discountPercentages = Math.round((discountAmount / originalPrice) * 100);
        discountType = "compare_price";
      }
      // Priority 2: Check for item-based discount
      else if (currentUser && currentUser.customerId) {
        const itemDiscount = itemBasedDiscounts.find(
          discount => discount.productSku === item.sku && discount.customerId === currentUser.customerId
        );

        if (itemDiscount) {
          discountPercentages = itemDiscount.percentage;
          discountType = "item_based";
        }
        // Priority 3: Check for pricing group discount
        else if (item.pricingGroup) {
          const itemPricingGroupId = typeof item.pricingGroup === 'object'
            ? item.pricingGroup._id
            : item.pricingGroup;

          const groupDiscountDoc = customerGroupsDiscounts.find(
            discount => discount.pricingGroup && discount.pricingGroup._id === itemPricingGroupId
          );

          if (groupDiscountDoc) {
            const customerDiscount = groupDiscountDoc.customers.find(
              customer => customer.user && customer.user.customerId === currentUser.customerId
            );

            if (customerDiscount) {
              discountPercentages = Math.abs(parseFloat(customerDiscount.percentage));
              discountType = "pricing_group";
            }
          }
        }
      }

      const cartData = {
        customerId: currentUser._id,
        productId: itemType === 'product' ? item._id : null,
        productGroupId: itemType === 'productGroup' ? item._id : null,
        packQuentity: packQuantity,
        unitsQuantity: quantity,
        totalQuantity: totalQuantity,
        packType: itemType === 'productGroup' ? 'Each' : (item.typesOfPacks?.find(pack => pack._id === selectedUnitId) ?
          item.typesOfPacks.find(pack => pack._id === selectedUnitId).name : 'Each'),
        amount: totalAmount,
        discountType: discountType,
        discountPercentages: discountPercentages
      };

      // console.log("Updating cart data:", cartData);

      const response = await axiosInstance.post('cart/add-to-cart', cartData);

      if (response.data.statusCode === 200) {
        await fetchCustomersCart();
        setCartItemsCount(response.data.data.cartItems?.length || 0);
        setError(null);
        setStockError(null);

        // Show success notification for update
        showNotification(`${getItemName()} updated in cart successfully!`);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Error updating cart');
      showNotification("Failed to update cart item", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch product by ID
  const fetchProductById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance(`products/get-product/${productID}`);

      // console.log("response product details", response);

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

  // Fetch product group by ID
  const fetchProductGroupById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance(`product-group/get-product-group/${productGroupId}`);

      // console.log("response product group details", response);

      if (response.data.statusCode === 200) {
        const productGroupData = response.data.data;
        setProductGroup(productGroupData);

        // Product groups don't have typesOfPacks, so no need to set selectedUnitId
      } else {
        setError(response.data.message || "Failed to fetch product group");
      }
    } catch (error) {
      console.error("Error fetching product group:", error);
      setError("An error occurred while fetching product group");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer's cart
  const fetchCustomersCart = async () => {
    try {
      if (!currentUser || !currentUser._id) return;

      const response = await axiosInstance.get(`cart/get-cart-by-customer-id/${currentUser._id}`);

      // console.log("Cart items:", response.data.data.items);
      if (response.data.statusCode === 200) {
        setCartItems(response.data.data.items || []);
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

      // console.log("Customer groups discounts:", response.data.data);

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

      // console.log("customers item based discounts:", response.data.data);

      if (response.data.statusCode === 200) {
        setItemBasedDiscounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching item based discounts:', error);
    }
  };

  const handleAddToWishList = async (itemId = null) => {
    try {
      if (!currentUser || !currentUser._id) {
        setError("Please login to manage wishlist")
        showNotification("Please login to manage wishlist", "error");
        return
      }

      // Use provided itemId or current item's ID
      const targetItemId = itemId || (getCurrentItem()?._id);
      if (!targetItemId) return;

      setWishlistLoading(true)

      const response = await axiosInstance.post('wishlist/add-to-wishlist', {
        customerId: currentUser._id,
        productId: itemType === 'product' ? targetItemId : null,
        productGroupId: itemType === 'productGroup' ? targetItemId : null
      })

      // console.log("Wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        await fetchCustomersWishList();
        setWishlistItemsCount(response.data.data?.wishlistItems?.length || response.data.data?.length || 0);

        // Show wishlist notification
        const itemName = getItemName();
        const action = isInWishlist(targetItemId) ? "removed from" : "added to";
        showNotification(`${itemName} ${action} wishlist!`);
      }
    } catch (error) {
      console.error('Error managing item in wishlist:', error)
      setError('Error managing wishlist')
      showNotification("Error managing wishlist", "error");
    } finally {
      setWishlistLoading(false)
    }
  }

  const fetchCustomersWishList = async () => {
    try {
      if (!currentUser || !currentUser._id) return

      const response = await axiosInstance.get(`wishlist/get-wishlist-by-customer-id/${currentUser._id}`)

      // console.log("customers wishlist response:", response.data)

      if (response.data.statusCode === 200) {
        setWishlistItems(response.data.data || [])
        setWishlistItemsCount(response.data.data?.length || 0)
      }
    }
    catch (error) {
      console.error('Error fetching customer wishlist:', error)
    }
  }

  const isInWishlist = (itemId = null) => {
    const targetItemId = itemId || (getCurrentItem()?._id);
    if (!targetItemId) return false;

    if (!wishListItems || !Array.isArray(wishListItems)) {
      return false;
    }

    return wishListItems.some(item => {
      if (itemType === 'product') {
        return item.product?._id === targetItemId;
      } else {
        return item.productGroup?._id === targetItemId;
      }
    });
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
    if ((categoryId || subCategoryId || subCategoryTwoId || brandId) && (productID || productGroupId)) {
      fetchRelatedItems();
    }
  }, [categoryId, subCategoryId, subCategoryTwoId, brandId, productID, productGroupId]);

  if (loading && !getCurrentItem()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
      </div>
    );
  }

  if (!getCurrentItem()) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Item not found</p>
      </div>
    );
  }

  const isInCart = isItemInCart();
  const cartItem = getCartItem();
  const isOutOfStock = isItemOutOfStock();
  const itemImages = getItemImages(getCurrentItem());

  // Calculate prices for main item using the same logic as product listing
  const mainDiscountedPrice = calculateDiscountedPrice(getCurrentItem());
  const mainDiscountPercentage = getDiscountPercentage(getCurrentItem());
  const mainHasDiscount = hasDiscount(getCurrentItem());

  // Render product group badge
  const renderProductGroupBadge = () => {
    if (itemType !== 'productGroup') return null;

    return (
      <div className="absolute top-2 left-2 z-10">
        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
          BUNDLE
        </div>
      </div>
    );
  };

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onHide={hideNotification}
      />

      {/* Breadcrumb */}
      <div className="bg-white justify-items-center pt-4 overflow-x-hidden">
        <div className="md mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
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
            {getItemName()}
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

        {/* Main Item Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
          {/* Item Images */}
          <div className="space-y-4 flex flex-col lg:flex-row lg:space-x-16 lg:space-y-0">
            {/* Thumbnail Images */}
            {itemImages.length > 0 && (
              <div className="order-2 lg:order-1 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {itemImages.map((image, index) => (
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
                {itemType === 'product' && getCurrentItem().badge && (
                  <span
                    className="absolute top-2 left-2 z-10 text-white text-[11px] font-[600] font-spartan tracking-widest px-2 py-1 rounded-lg"
                    style={{ backgroundColor: getCurrentItem().badge.backgroundColor }}
                  >
                    {getCurrentItem().badge.text}
                  </span>
                )}

                {/* Product Group Badge */}
                {renderProductGroupBadge()}

                {/* Navigation Buttons - Only show if multiple images */}
                {itemImages.length > 1 && (
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
                      src={itemImages[selectedImage] || "/placeholder.svg"}
                      alt={getItemName()}
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

          {/* Item Information */}
          <div className="space-y-[17px] font-spartan xl:max-w-[360px] mt-5">
            {/* Header */}
            <div>
              <h1 className="text-lg sm:text-xl lg:text-[1.3rem] font-medium text-black ">
                {getItemName()}
              </h1>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[13px] font-medium">SKU: {getItemSku()}</p>
                <span className={`text-[14px] ${isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-[#E7FAEF] text-black'} p-2 font-semibold font-spartan py-1 rounded`}>
                  {isOutOfStock ? '✗ OUT OF STOCK' : '✓ IN STOCK'}
                </span>
              </div>
            </div>

            {/* Product Group Info */}
            {itemType === 'productGroup' && getCurrentItem().products && getCurrentItem().products.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium">
                  This bundle includes {getCurrentItem().products.length} product(s)
                </p>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-[24px] font-semibold text-[#2D2C70]">
                ${mainDiscountedPrice.toFixed(2)}
              </span>
              {mainHasDiscount && getCurrentItem().eachPrice && mainDiscountedPrice < getCurrentItem().eachPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${getCurrentItem().eachPrice.toFixed(2)}
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

            {/* Quantity & Units - Only show units for products */}
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
                    disabled={isOutOfStock || calculateTotalQuantity() >= getStockLevel()}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block bg-gray-300 w-[1px] h-14"></div>

              {/* Units - Only for products */}
              {itemType === 'product' && (
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
                      {getCurrentItem().typesOfPacks && getCurrentItem().typesOfPacks.length > 0 ? (
                        getCurrentItem().typesOfPacks.map((pack) => (
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
              )}
            </div>

            {/* Action Buttons - Row 1 */}
            <div className="space-y-[17px]">
              {/* Add to Cart and Wishlist Row - Only show when NOT in cart */}

              <div className="flex items-center space-x-5">
                <button
                  className="flex items-center border border-black text-white bg-[#46BCF9] xl:min-w-[360px] justify-center flex-1 gap-2 text-[15px] font-semibold border border-[#46BCF9] rounded-lg text-white py-2 px-6 transition-colors duration-300 group disabled:bg-gray-400 disabled:border-gray-400"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || calculateTotalQuantity() > getStockLevel() || loading || !!stockError}
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
                  onClick={() => handleAddToWishList()}
                  className="flex items-center justify-center rounded-full"
                  disabled={wishlistLoading}
                >
                  <div className="h-8 w-8 bg-[#D9D9D940] p-2 flex mt-3 items-center justify-center rounded-full transition-colors cursor-pointer">
                    {wishlistLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E9098D]"></div>
                    ) : isInWishlist() ? (
                      <Heart className="w-4 h-4" fill="#E9098D" stroke="#E9098D" />
                    ) : (
                      <Heart className="w-4 h-4" fill="none" stroke="#D9D9D9" />
                    )}
                  </div>
                </button>
              </div>

              {/* Added and Update Row - Only show when item is in cart */}
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
                    disabled={isOutOfStock || calculateTotalQuantity() > getStockLevel() || loading || !!stockError}
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
              <h3 className="text-[1rem] font-medium text-black">Details:</h3>
              <div
                className="text-black text-[15px] font-[400]"
                dangerouslySetInnerHTML={{
                  __html: getItemDescription(),
                }}
              />
            </div>

            {/* Barcode */}
            <div className="text-[1rem] font-[400] text-black">
              <h4 className="text-black">Barcode</h4>
              <p className="">{getItemBarcode()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 min-w-[90vw] h-[1px] flex my-8 relative lg:right-34"></div>

        {/* Related Items Section */}
        {/* Related Items Section */}
        <div className="space-y-8 lg:space-y-12 pb-18">
          <h2 className="text-xl sm:text-2xl lg:text-[2rem] font-medium text-center text-[#2E2F7F]">
            Related Items
          </h2>

          {relatedItemsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D2C70]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedItems.map((item) => {
                const isProductGroup = item.type === 'productGroup';
                const isInCart = isRelatedItemInCart(item._id, isProductGroup);
                const cartItem = getRelatedCartItem(item._id, isProductGroup);
                const isInWishlist = isRelatedItemInWishlist(item._id, isProductGroup);
                const isOutOfStock = isProductGroup ?
                  (item.products && item.products.some(product => product.stockLevel <= 0)) :
                  (item.stockLevel <= 0);
                const stockError = relatedItemsStockErrors[item._id];
                const isWishlistLoading = relatedItemsLoadingWishlist[item._id];
                const isCartLoading = relatedItemsLoadingCart[item._id];

                const discountedPrice = calculateDiscountedPrice(item);
                const discountPercentage = getDiscountPercentage(item);
                const hasItemDiscount = hasDiscount(item);
                const itemImages = getItemImages(item);

                return (
                  <div key={item._id} className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col h-full">
                    {/* Wishlist Icon & Badge Container */}
                    <div className="relative mb-3">
                      <button
                        onClick={() => handleRelatedAddToWishList(item._id, isProductGroup)}
                        disabled={isWishlistLoading}
                        className="absolute top-0 right-0 z-10"
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

                      {/* Product Group Badge */}
                      {isProductGroup && (
                        <div className="absolute top-0 left-0 z-10">
                          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                            BUNDLE
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Item Image - Fixed Height Container */}
                    <div
                      className="relative flex justify-center items-center py-6 mb-4  rounded-xl cursor-pointer bg-gray-50 min-h-[180px]"
                      onClick={() => handleRelatedItemClick(
                        isProductGroup ? item.name : item.ProductName,
                        item._id,
                        isProductGroup
                      )}
                    >
                      <img
                        src={itemImages[0] || "/placeholder.svg"}
                        alt={isProductGroup ? item.name : item.ProductName}
                        className="max-h-[140px] w-auto object-contain"
                      />
                    </div>

                    {/* Item Info - Flex column that grows to fill space */}
                    <div className="flex flex-col flex-grow">
                      <h3
                        className="text-gray-900 text-sm mb-2 line-clamp-2 hover:text-[#E9098D] cursor-pointer min-h-[40px] flex items-start"
                        onClick={() => handleRelatedItemClick(
                          isProductGroup ? item.name : item.ProductName,
                          item._id,
                          isProductGroup
                        )}
                      >
                        {isProductGroup ? item.name : item.ProductName}
                      </h3>

                      <div className="font-spartan text-[14px] font-medium flex-grow">
                        <p className="mb-2 text-xs text-gray-600">SKU: {item.sku}</p>

                        {/* Product Group Info */}
                        {isProductGroup && item.products && item.products.length > 0 && (
                          <div className="mb-2 text-xs text-blue-600">
                            Includes {item.products.length} product(s)
                          </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`flex items-center space-x-1 px-2 py-1 ${isOutOfStock ? 'bg-red-100' : 'bg-[#E7FAEF]'}`}>
                            <svg className={`w-3 h-3 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className={`text-xs font-semibold font-spartan ${isOutOfStock ? 'text-red-600' : 'text-black'}`}>
                              {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-[#2D2C70] text-[16px] font-semibold">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          {hasItemDiscount && item.eachPrice && discountedPrice < item.eachPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              ${item.eachPrice.toFixed(2)}
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
                          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs mb-3">
                            {stockError}
                          </div>
                        )}

                        {/* Units Dropdown - Only for products */}
                        {!isProductGroup && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Units</label>
                            <div className="relative w-full">
                              <select
                                value={relatedItemsSelectedUnits[item._id] || ''}
                                onChange={(e) => handleRelatedUnitChange(item._id, e.target.value, item)}
                                disabled={isOutOfStock}
                                className="w-full border border-gray-200 rounded-md pl-2 pr-8 py-2 text-xs 
                                focus:outline-none focus:ring-1 focus:ring-[#2d2c70] focus:border-[#2d2c70] 
                                appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                {item.typesOfPacks && item.typesOfPacks.length > 0 ? (
                                  item.typesOfPacks.map((pack) => (
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
                        )}

                        {/* Quantity Controls */}
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">Quantity</span>
                          <div className="flex items-center space-x-2">
                            <button
                              className="w-6 h-6 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                              onClick={() => handleRelatedQuantityChange(item._id, -1, isProductGroup)}
                              disabled={(relatedItemsQuantities[item._id] || 1) <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[1.5rem] text-center">
                              {relatedItemsQuantities[item._id] || 1}
                            </span>
                            <button
                              className="w-6 h-6 bg-black text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                              onClick={() => handleRelatedQuantityChange(item._id, 1, isProductGroup)}
                              disabled={isOutOfStock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Add to Cart Button Area */}
                        <div className="mt-auto">
                          {/* Add to Cart Button - Show when NOT in cart */}

                          <button
                            className={`flex w-full  mb-2 items-center justify-center gap-2 text-sm font-semibold border rounded-lg py-2 transition-colors duration-300 ${isOutOfStock || isCartLoading || stockError
                              ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                              : 'bg-[#46BCF9] text-white border-[#46BCF9] hover:bg-[#3aa8e0]'
                              }`}
                            onClick={() => handleRelatedAddToCart(item._id, isProductGroup)}
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

                          {/* Action Buttons Row - Only show when item is in cart */}
                          {isInCart && (
                            <div className="flex space-x-2">
                              <button
                                className="flex-1 border border-[#2D2C70] text-white bg-[#2D2C70] rounded-lg py-2 text-xs font-medium transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled
                              >
                                <span>Added</span>
                                <Check className="ml-1 h-3 w-3" />
                              </button>
                              <button
                                className={`flex-1 border rounded-lg py-2 text-xs font-medium transition-colors ${isOutOfStock || isCartLoading || stockError
                                  ? 'bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed'
                                  : 'border-[#E799A9] bg-[#E799A9] text-white hover:bg-[#d68999]'
                                  }`}
                                onClick={() => handleRelatedAddToCart(item._id, isProductGroup)}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!relatedItemsLoading && relatedItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">No related items found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetail;