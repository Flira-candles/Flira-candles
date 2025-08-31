let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() 
{
    const cartItemsDiv = document.getElementById("cart-items");
    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
        document.getElementById("cart-total").textContent = "";
        return;
    }

   cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    // if item has originalPrice (combo with discount), show strike + discount
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
}


function removeItem(index) {
    cart.splice(index, 1); // Remove from array
    localStorage.setItem("cart", JSON.stringify(cart)); // Save updated cart
    renderCart(); // Re-render UI
}

function checkoutWhatsApp() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const WHATSAPP_NUMBER = "9811522858";
    let message = "Hello Flira! I want to order:\n";

    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.qty * item.price; // calculate total for this item
        totalPrice += itemTotal;
        message += `${item.name} - Qty: ${item.qty} - ₹${itemTotal.toFixed(2)}\n`;
    });

    message += `Total Price: ₹${totalPrice.toFixed(2)}\n`; // add total price at the end

    const encoded = encodeURIComponent(message);

    // Open WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encoded}`, "_blank");

    // Clear cart after checkout
    localStorage.removeItem("cart");
    cart = [];
    renderCart();        // updates cart section
    updateCartUI();      // updates total price display if cart section is separate
}




renderCart();
