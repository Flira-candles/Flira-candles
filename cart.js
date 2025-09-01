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
    function getSelectedPacking() {
  const selected = document.querySelector('input[name="packing"]:checked').value;
  let cost = selected === "gift" ? 60 : 0;
  return { type: selected, cost };
}
// Update cart total with wrapping cost
function updateCartTotal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Add wrapping cost
  const packing = getSelectedPacking();
  total += packing.cost;

  document.getElementById("cart-total").innerText = "₹" + total;
}

// Update cart UI when packing changes
document.querySelectorAll('input[name="packing"]').forEach(input => {
  input.addEventListener("change", updateCartTotal);
});

function checkoutWhatsApp() {
    let packing = getSelectedPacking();

    if (cart.length === 0) {
        location.href="index.html#products";
        return;
    }

    const addressField = document.getElementById("address");
    const address = addressField.value.trim();
    if (address === "") {
            addressField.classList.add("shake"); // add shake animation
        setTimeout(() => {
            addressField.classList.remove("shake"); // remove after animation
        }, 800);
        return;
    }
        
    const WHATSAPP_NUMBER = "919696547412"; // your WhatsApp number
    let message = "Hello Flira! I want to order:\n";
    
    cart.forEach(item => {
        message += `${item.name} - Qty: ${item.qty}\n`;
    });

    message += `\n📍 Delivery Address:\n${address}`;
    message += `\n🎁 Packing: ${packing === "gift" ? "Gift Wrapping" : "Normal Wrapping"}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");

    // Clear cart after checkout
    localStorage.removeItem("cart");
    cart = [];
    renderCart();        // updates cart section
    updateCartUI();      // updates total price display if cart section is separate
}
renderCart();
