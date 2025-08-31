let cart = [];
const WHATSAPP_NUMBER = "9811522858"; // Your WhatsApp number

document.getElementById("orderForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const product = document.getElementById('product').value.trim();
    const qty = document.getElementById('qty').value || 1;
    const messageText = document.getElementById('message').value.trim();

    const message = `Hello Flira! I have an inquiry/order:\n` +
                    `Name: ${name}\nPhone: ${phone}\n` +
                    (product ? `Product: ${product}\n` : '') +
                    `Quantity: ${qty}\nMessage: ${messageText}`;

    const encoded = encodeURIComponent(message);

    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encoded}`, "_blank");
});

// ---------------- CART COUNT ----------------
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
        cartCountEl.textContent = totalQty;
    }
}
// ---------------- CART UI ----------------
function updateCartUI() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalContainer = document.getElementById("cart-total");

    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;

   cart.forEach(item => {
    // For extras, treat them like normal products
    const product = item.name;
    const fragrance = item.fragrance || ""; // extras likely don’t have fragrance/color
    const color = item.color || "";

    const originalPrice = item.originalPrice || item.price;
    const discountedTotal = item.qty * item.price;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");

    itemDiv.innerHTML = `
        <div class="cart-line"><strong>${product}</strong> (x${item.qty})</div>
        ${fragrance ? `<div class="cart-line">Fragrance: ${fragrance}</div>` : ""}
        ${color ? `<div class="cart-line">Color: ${color}</div>` : ""}
        <div class="cart-line price">
            <strong>₹${Math.round(discountedTotal)}</strong>
        </div>
    `;

    cartItemsContainer.appendChild(itemDiv);
});


    cartTotalContainer.textContent = `Total: ₹${totalPrice.toFixed(2)}`;
}



// ---------------- PRODUCT OPTION HTML ----------------
const fragranceOptions = `
    <div class="product-options compact-options">
        <select class="fragrance">
        <option value="" disabled selected hidden>-- Select Fragrance --</option>
            <option value="none">none</option>
            <option value="Lavender">Lavender</option>
            <option value="Vanilla">Vanilla</option>
            <option value="Rose">Rose</option>
            <option value="sandalwood">Sandalwood</option>
        </select>
        <input type="text" class="custom-fragrance compact-input" placeholder="Enter fragrance" maxlength="15" style="display:none;">
    </div>
`;

const colorOptions = `
    <div class="product-options compact-options">

        <select class="color">
        <option value="" disabled selected hidden>-- Select Color --</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Gold">Gold</option>
            <option value="other">Specify</option> 
        </select>
         <input type="text" class="custom-color compact-input" placeholder="Enter color" maxlength="15" style="display:none;">
    </div>
`;

const qtyControl = `
    <div class="quantity-control">
        <button onclick="changeQty(this, -1)">-</button>
        <input class="box qty compact-input" type="number" value="1" min="1" readonly>
        <button onclick="changeQty(this, 1)">+</button>
    </div>
`;

// ---------------- QTY CHANGE FUNCTION ----------------
function changeQty(btn, amount) {
    const qtyInput = btn.parentElement.querySelector(".qty");
    let value = parseInt(qtyInput.value, 10) + amount;
    if (value < 1) value = 1;
    qtyInput.value = value;
}

// ---------------- ADD TO CART ----------------
function addToCart(productCard) {
    const name = productCard.dataset.name;

    let basePrice = parseFloat(productCard.dataset.price);
    const discountPercent = parseFloat(productCard.dataset.discount) || 0;

    // fragrance
    const fragranceSelect = productCard.querySelector(".fragrance");
    let fragrance = fragranceSelect ? fragranceSelect.value : "None";
    if (fragrance === "other") {
        fragrance = productCard.querySelector(".custom-fragrance").value.trim() || "None";
    }

    // ✅ add fragrance extra cost
    const fragranceExtra = fragrancePrices[fragrance] || 0;
    basePrice += fragranceExtra;

    // color
    const colorSelect = productCard.querySelector(".color");
    let color = colorSelect ? colorSelect.value : "None";
    if (color === "other") {
        color = productCard.querySelector(".custom-color").value.trim() || "None";
    }

    // qty
    const qtyInput = productCard.querySelector(".qty");
    const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

    // ✅ apply discount if available (after fragrance extra is added)
    const discountedPrice = discountPercent > 0 
        ? basePrice - (basePrice * discountPercent / 100) 
        : basePrice;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemName = `${name} - ${fragrance} - ${color}`;

    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({
            name: itemName,
            qty,
            price: discountedPrice,   // ✅ discounted + fragrance
            originalPrice: basePrice, // ✅ show with strike
            discount: discountPercent
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
}

// ---------------- COMBO CART ----------------
function addComboToCart() {
    const c1 = document.getElementById("combo1").value;
    const c2 = document.getElementById("combo2").value;
    const c3 = document.getElementById("combo3").value;
    const qty = parseInt(document.getElementById("combo-qty-control").value, 10) || 1;

    let comboName = `Combo Set: ${c1} + ${c2}`;
    let comboPrice = 300; // base price for 2 items

    if (c3 !== "None") {
        comboName += ` + ${c3}`;
        comboPrice += 89; 
    }

    let originalPrice = comboPrice;
    let discountedPrice = comboPrice - (comboPrice * 0.2); //0.2 is discount of 20%

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.name === comboName);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({ 
                name: comboName, 
                qty, 
                price: comboPrice * 0.8,        // discounted price
                originalPrice: comboPrice       // original price (before discount)
            });
        }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    updateCartUI(); // ensure cart UI updates with new price
}


// ---------------- SCROLL TO TOP ----------------
const backToTopBtn = document.getElementById("backToTop");
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});
backToTopBtn.addEventListener("click", scrollToTop);

// ---------------- EXTRAS PANEL ----------------
document.getElementById("extrasBtn")?.addEventListener("click", function () {
    document.getElementById("extrasPanel").classList.add("open");
});
document.getElementById("closeExtras")?.addEventListener("click", function () {
    document.getElementById("extrasPanel").classList.remove("open");
});

document.addEventListener("click", function (event) {
    const panel = document.getElementById("extrasPanel");
    const button = document.getElementById("extrasBtn");

    if (
        panel.classList.contains("open") &&   // panel is open
        !panel.contains(event.target) &&      // clicked outside panel
        !button.contains(event.target)        // clicked not on the open button
    ) {
        panel.classList.remove("open");
    }
});
// ---------------- DOM READY ----------------
document.addEventListener("DOMContentLoaded", function ()
 {
    // Auto insert fragrance, color, qty into every product
    document.querySelectorAll(".product-options-container").forEach(container => {
        container.innerHTML = fragranceOptions + colorOptions + qtyControl;
    });

        // Show/hide custom fragrance input
        document.addEventListener("change", function (e) {

        if (e.target.classList.contains("fragrance")) {
            const customInput = e.target.parentElement.querySelector(".custom-fragrance");
            if (e.target.value === "other") {
                customInput.style.display = "block";
            } else {
                customInput.style.display = "none";
                customInput.value = "";
            }
        }
    
        if (e.target.classList.contains("color")) {
            const customInput = e.target.parentElement.querySelector(".custom-color");
            if (e.target.value === "other") {
                customInput.style.display = "block";
            } else {
                customInput.style.display = "none";
                customInput.value = "";
            }
        }
    });

    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", function () {
            const productCard = this.closest(".product-card");
            addToCart(productCard);
        });
    });
    updateCartCount(); // initial count
});

function addExtraToCart(extraName) {
    const qty = 1; // default quantity
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const extraPrice = extraPrices[extraName] || 0;

    const existingItem = cart.find(item => item.name === extraName);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ name: extraName, qty, price: extraPrice });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    updateCartUI(); // updates cart display including price
}

document.querySelectorAll(".btn.add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("clicked");          // add click effect
    setTimeout(() => btn.classList.remove("clicked"), 200); // revert after 150ms
  });
});

document.querySelectorAll(".btn1").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("clicked");             // add glow & shrink
    setTimeout(() => btn.classList.remove("clicked"), 200); // remove after 200ms
  });
});


// tap change 
document.querySelectorAll(".product-slider").forEach(slider => {
  let index = 0;
  const imgs = slider.querySelectorAll("img");

  slider.addEventListener("click", () => {
    imgs[index].classList.remove("active");
    index = (index + 1) % imgs.length; // move to next image
    imgs[index].classList.add("active");
  });
});

const fragrancePrices = {
    "Lavender": 5.25,
    "Vanilla": 3.25,
    "Rose": 5.25,
    "sandalwood":3.25,
    "other": 5 // no extra charge for custom fragrance
};

const extraPrices = {
    "Heart tray": 49,
    "oval tray":49,
    "Hexagon tealight container": 29,
    "flower tealight container":49,
    "circle tealight container":29
};

const viewCartBtn = document.getElementById("viewCartBtn");
const loader = document.getElementById("fullScreenLoader");

viewCartBtn.addEventListener("click", (e) => {
    e.preventDefault(); // stop immediate navigation
    loader.style.display = "flex"; // show loader
    
    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.href = "cart.html";
    }, 2000);
});

const backToTop = document.getElementById('backToTop');

backToTop.addEventListener('click', () => {
  // Add click animation
  backToTop.classList.add('clicked');

  // Remove the class after animation duration (200ms)
  setTimeout(() => {
    backToTop.classList.remove('clicked');
  }, 200);

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener("load", () => {
    const minLoaderTime = 2000;
    const startTime = Date.now();
    const mainContent = document.getElementById("mainContent");

    function hideLoader() {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minLoaderTime - elapsed);

        setTimeout(() => {
            const loader = document.getElementById("websiteLoader");
            loader.style.transition = "opacity 0.5s";
            loader.style.opacity = "0";

            setTimeout(() => {
                loader.style.display = "none";
                mainContent.style.display = "block";
            }, 500); // match fade-out duration
        }, delay);
    }

    // Show loader only once per session
    if (!sessionStorage.getItem("loaderShown")) {
        sessionStorage.setItem("loaderShown", "true");

        // Preload all images inside mainContent
        const images = mainContent.querySelectorAll("img");
        let loadedImages = 0;
        if (images.length === 0) {
            hideLoader(); // No images, hide loader immediately
        } else {
            images.forEach(img => {
                if (img.complete) {
                    loadedImages++;
                    if (loadedImages === images.length) hideLoader();
                } else {
                    img.addEventListener("load", () => {
                        loadedImages++;
                        if (loadedImages === images.length) hideLoader();
                    });
                    img.addEventListener("error", () => {
                        loadedImages++;
                        if (loadedImages === images.length) hideLoader();
                    });
                }
            });
        }
    } else {
        // Loader already shown in this session
        document.getElementById("websiteLoader").style.display = "none";
        mainContent.style.display = "block";
    }
});



