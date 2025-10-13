let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
    const cartItemsDiv = document.getElementById("cart-items");
    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("cart-total").textContent = "";
        clearTotals();
        return;
    }

    cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";

        let priceDisplay;
        if (item.originalPrice) {
            priceDisplay = `<s>₹${(item.qty * item.originalPrice).toFixed(2)}</s> 
                            <span style="color:green;">₹${(item.qty * item.price).toFixed(2)}</span>`;
        } else {
            priceDisplay = `₹${(item.qty * item.price).toFixed(2)}`;
        }

        div.innerHTML = `
            ${item.name} - Qty: ${item.qty} - ${priceDisplay}
            <button class="btn" onclick="removeItem(${index})">Delete</button>
        `;
        cartItemsDiv.appendChild(div);
    });

    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);

    document.getElementById("cart-total").textContent =
        `Total Items: ${totalQty} | Total Price: ₹${totalPrice.toFixed(2)}`;

    // ✅ Also update totals when rendering cart
    updateCartTotal();
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function getSelectedPacking() {
    const selected = document.querySelector('input[name="packing"]:checked');
    const type = selected ? selected.value : "normal";
    const cost = type === "gift" ? 60 : 0;
    return { type, cost };
}

function getShippingCost() {
    const pincodeField = document.getElementById("pincode");
    if (!pincodeField) return 0;
    const pincode = pincodeField.value.trim();

    if (!pincode) return 0;
    if (pincode.startsWith("11")) return 40;
    return 200;
}

// ✅ Show subtotal, packing, shipping, and total
function updateCartTotal() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const packing = getSelectedPacking();
    const shipping = getShippingCost();
    const finalTotal = subtotal + packing.cost + shipping;

    const summary = `
Subtotal: ₹${subtotal.toFixed(2)}
Packing: ₹${packing.cost.toFixed(2)}
Shipping: ₹${shipping.toFixed(2)}
-------------------------
Final Total: ₹${finalTotal.toFixed(2)}
    `;

    const totalDiv = document.getElementById("cart-total");
    totalDiv.style.whiteSpace = "pre-line";
    totalDiv.innerText = summary;
}

// ✅ Clear totals when no items
function clearTotals() {
    const totalDiv = document.getElementById("cart-total");
    totalDiv.style.whiteSpace = "pre-line";
    totalDiv.innerText = `
Subtotal: ₹0.00
Packing: ₹0.00
Shipping: ₹0.00
-------------------------
Final Total: ₹0.00
    `;
}

// ✅ Update total when packing or pincode changes
document.querySelectorAll('input[name="packing"]').forEach(input => {
    input.addEventListener("change", updateCartTotal);
});
document.addEventListener("input", e => {
    if (e.target.id === "pincode") updateCartTotal();
});

// ✅ WhatsApp checkout function restored
function checkoutWhatsApp() {
    const packing = getSelectedPacking();
    const shipping = getShippingCost();

    if (cart.length === 0) {
        location.href = "index.html#products";
        return;
    }

    // Get shipping details
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const street = document.getElementById("street")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const state = document.getElementById("state")?.value.trim();
    const pincode = document.getElementById("pincode")?.value.trim();

    if (!name || !phone || !street || !city || !state || !pincode) {
        alert("Please fill out all shipping details before checkout.");
        return;
    }

    // ✅ Calculate totals
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const finalTotal = subtotal + packing.cost + shipping;

    const WHATSAPP_NUMBER = "9898521142";
    let message = "🕯️ Flira Candle Order\n----------------------\n";

    // List items with price
    cart.forEach(item => {
        message += `${item.name} x${item.qty} - ₹${(item.price * item.qty).toFixed(2)}\n`;
    });

    // Add summary
    message += `----------------------\n`;
    message += `🎁 Packing: ₹${packing.cost.toFixed(2)}\n`;
    message += `🚚 Shipping: ₹${shipping.toFixed(2)}\n`;
    message += `💰 Final Total: ₹${finalTotal.toFixed(2)}\n`;

    // Add address
    message += `\n📍 Delivery Address:\n${name}\n${phone}\n${street}\n${city}, ${state} - ${pincode}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");

    // Clear cart
    localStorage.removeItem("cart");
    cart = [];
    renderCart();
}


// ✅ Initial render
renderCart();
