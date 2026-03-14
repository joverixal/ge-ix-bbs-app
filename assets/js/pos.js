// pos.js - Fully offline capable using IndexedDB (idb.js)

let products = [];
let carts = [];

// ---------------- IndexedDB Setup ----------------
const dbPromise = idb.openDB('rixal-pos-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('products')) {
      db.createObjectStore('products', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('offlinePayments')) {
      db.createObjectStore('offlinePayments', { autoIncrement: true });
    }
  }
});

// ---------------- IndexedDB Helpers ----------------
async function saveProductsToDB(products) {
  const db = await dbPromise;
  const tx = db.transaction('products', 'readwrite');
  const store = tx.objectStore('products');
  store.clear(); // remove old products
  products.forEach(p => store.put(p));
  await tx.done;
}

async function loadProductsFromDB() {
  const db = await dbPromise;
  const store = db.transaction('products', 'readonly').objectStore('products');
  return await store.getAll();
}

async function saveOfflinePayment(payload) {
  const db = await dbPromise;
  const tx = db.transaction('offlinePayments', 'readwrite');
  const store = tx.objectStore('offlinePayments');
  await store.add(payload);
  await tx.done;
}

async function getOfflinePayments() {
  const db = await dbPromise;
  const store = db.transaction('offlinePayments', 'readonly').objectStore('offlinePayments');
  return await store.getAll();
}

async function deleteOfflinePayment(key) {
  const db = await dbPromise;
  const tx = db.transaction('offlinePayments', 'readwrite');
  const store = tx.objectStore('offlinePayments');
  await store.delete(key);
  await tx.done;
}

// ---------------- Document Ready ----------------
$(document).ready(function () {

  toastr.options = {
    positionClass: "toast-bottom-center",
    timeOut: 3000
  };

  // Redirect if not logged in
  if (!localStorage.getItem("isLoggedIn")) window.location.href = "index.html";

  // Highlight nav
  const path = window.location.pathname.split("/").pop();
  if (path === "pos.html") $("#nav-pos").addClass("active");
  if (path === "products.html") $("#nav-products").addClass("active");
  if (path === "sales.html") $("#nav-sales").addClass("active");

  $("#nav-logout").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  });

  $("#btn-clear-cash").click(function () {
    $("#inp-cash-received").val("").focus();
    const amountDue = parseFloat($('#inp-amount-due').val()) || 0;
    $("#inp-changed").val(-amountDue);
  });

  // Load products (offline & online)
  loadProducts();

  async function loadProducts() {
    const $sel = $("#sel-products");
    $sel.prop("disabled", true).html('<option>Loading...</option>');

    // Load from IndexedDB first
    let cachedProducts = await loadProductsFromDB();
    if (cachedProducts.length > 0) {
      products = cachedProducts;
      renderProducts(products);
    }

    // Try loading from API
    try {
      const res = await $.ajax({ url: API_URL, method: "GET", data: { action: "getServices" } });
      const data = typeof res === "string" ? JSON.parse(res) : res;
      products = data.products || [];
      await saveProductsToDB(products);
      renderProducts(products);
    } catch (err) {
      toastr.warning("Offline: using local product database");
      console.log("Offline mode", err);
    }

    $sel.prop("disabled", false);
  }

  function renderProducts(list) {
    const $sel = $("#sel-products");
    $sel.empty().append('<option value="">Select Item</option>');
    list.forEach(p => $sel.append(`<option value="${p.id}">${p.name}</option>`));
  }

  // ---------------- Product Selection ----------------
  $("#sel-products").change(function () {
    const productId = $(this).val();
    const product = products.find(p => p.id === productId);
    if (!product) return toastr.error("Unknown product!");

    $("#lbl-item-title").text(product.name);
    $("#inp-id").val(product.id);
    $("#inp-unit-price").val(product.unitPrice);
    $("#inp-profit").val(product.profit);
    $("#inp-stock-on-hand").val(product.stockOnHand);
    $("#inp-selling-price").val(product.sellingPrice);
    $("#inp-quantity").val(1);

    $("#mdl-add-item").modal("show");
    $(this).val('');
  });

  $("#btn-increase").click(() => changeQuantity(1));
  $("#btn-decrease").click(() => changeQuantity(-1));

  function changeQuantity(delta) {
    let qty = parseFloat($("#inp-quantity").val()) || 1;
    qty = Math.max(0.5, qty + delta);
    $("#inp-quantity").val(qty);
  }

  // ---------------- Add to Cart ----------------
  $("#btn-add-item").click(function () {
    const id = $("#inp-id").val();
    const name = $("#lbl-item-title").text();
    const quantity = parseFloat($("#inp-quantity").val()) || 0;
    const sellingPrice = parseFloat($("#inp-selling-price").val());
    const stock = parseFloat($("#inp-stock-on-hand").val());

    if (quantity <= 0) return toastr.error("Enter valid quantity!");
    if (quantity > stock) return toastr.error("Quantity exceeds stock!");

    const exist = carts.find(c => c.id === id);
    if (exist) {
      exist.quantity += quantity;
      exist.totalAmount = exist.quantity * sellingPrice;
    } else {
      carts.push({ id, name, quantity, sellingPrice, totalAmount: quantity * sellingPrice });
    }

    updateCartUI();
    $("#mdl-add-item").modal("hide");
  });

  function updateCartUI() {
    const $div = $("#div-added-items");
    $div.empty();
    let total = 0;
    carts.forEach((item, i) => {
      total += item.totalAmount;
      $div.append(`
        <div class="d-flex justify-content-between align-items-center border p-2 rounded">
          <div><strong>${item.name}</strong><br>Qty: ${item.quantity} x ₱${item.sellingPrice} = ₱${item.totalAmount}</div>
          <button class="btn btn-sm btn-danger btn-remove" data-index="${i}"><i class="bi bi-trash"></i></button>
        </div>
      `);
    });

    $("#inp-amount-due").val(total);
    $("#inp-cash-received").val(total);
    $("#inp-changed").val(0);
  }

  $(document).on("click", ".btn-remove", function () {
    const index = $(this).data("index");
    carts.splice(index, 1);
    updateCartUI();
  });

  // ---------------- Cash Input ----------------
  $("#inp-cash-received").on("input", function () {
    const due = parseFloat($("#inp-amount-due").val()) || 0;
    const cash = parseFloat($(this).val()) || 0;
    $("#inp-changed").val(cash - due);
  });

  // ---------------- Cash Payment ----------------
  $("#btn-cash").click(async function () {
    const amountDue = parseFloat($("#inp-amount-due").val()) || 0;
    const cashReceived = parseFloat($("#inp-cash-received").val()) || 0;
    if (carts.length === 0) return toastr.error("No items added!");
    if (cashReceived < amountDue) return toastr.error("Insufficient cash!");

    const payload = { action: "cashPayment", amountDue, cashReceived, carts };

    try {
      await $.ajax({
        url: API_URL,
        method: "POST",
        data: JSON.stringify(payload),
        contentType: "application/json"
      });
      toastr.success("Payment saved online!");
      carts = [];
      updateCartUI();
    } catch (err) {
      await saveOfflinePayment(payload);
      toastr.warning("Offline: payment queued");
      carts = [];
      updateCartUI();
    }
  });

  // ---------------- Sync Offline Payments ----------------
  async function syncOfflinePayments() {
    const payments = await getOfflinePayments();
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      try {
        await $.ajax({
          url: API_URL,
          method: "POST",
          data: JSON.stringify(payment),
          contentType: "application/json"
        });
        await deleteOfflinePayment(i + 1); // auto-increment key
        toastr.success("Offline payment synced!");
      } catch (err) {
        console.log("Still offline, will retry later");
      }
    }
  }

  window.addEventListener("online", syncOfflinePayments);
  syncOfflinePayments();

});
