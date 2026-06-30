async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const users = await cloudGet("users", "select=*");

  const foundUser = users.find(user =>
    user.username === username &&
    user.password === password &&
    user.status === "Active"
  );

  if (!foundUser) {
    alert("Wrong username, password or inactive account");
    return;
  }

  localStorage.setItem("estock_logged_user", JSON.stringify(foundUser));
  window.location.href = "dashboard.html";
}
/* ITEMS */

function searchItems() {
  const input = document.getElementById("searchItem").value.toLowerCase();
  const rows = document.querySelectorAll("#itemsTable tbody tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}

function addItem() {
  document.getElementById("itemModal").style.display = "block";

  loadItemCategories();
  loadItemSuppliers();

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const nextNo = 10001 + items.length;

  if (document.getElementById("itemCode")) {
    document.getElementById("itemCode").value = "ITM-" + nextNo;
  }
}

function closeModal() {
  document.getElementById("itemModal").style.display = "none";
}

async function saveItem() {
  const code = document.getElementById("itemCode").value.trim();
  const name = document.getElementById("itemName").value.trim();
  const category = document.getElementById("itemCategory").value;
  const unit = document.getElementById("itemUnit").value;
  const supplier = document.getElementById("itemSupplier").value;
  const minStock = document.getElementById("itemMinStock").value.trim();
  const stock = document.getElementById("itemStock").value.trim();
  const location = document.getElementById("itemLocation").value.trim();

  if (!code || !name || !stock) {
    alert("Please fill all required fields");
    return;
  }

  const status =
    Number(stock) <= 0
      ? "Out of Stock"
      : Number(stock) <= Number(minStock || 5)
      ? "Low Stock"
      : "Available";

  const item = {
    code: code,
    name: name,
    category: category,
    unit: unit,
    supplier: supplier,
    min_stock: Number(minStock || 5),
    stock: Number(stock),
    location: location,
    status: status
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(item)
  });

  if (!response.ok) {
    alert("Failed to save item. Item code may already exist.");
    return;
  }

  alert("Item saved to cloud successfully");
  location.reload();
}

function addItemToTable(item) {
  const table = document.querySelector("#itemsTable tbody");
  if (!table) return;

  const row = table.insertRow();

  const stock = Number(item.stock || 0);
  const minStock = Number(item.min_stock || item.minStock || 5);

  let statusText = "Available";
  let badgeClass = "badge-success";

  if (stock <= 0) {
    statusText = "Out of Stock";
    badgeClass = "badge-danger";
  } else if (stock <= minStock) {
    statusText = "Low Stock";
    badgeClass = "badge-warning";
  }

  row.innerHTML = `
    <td>${item.code}</td>
    <td>${item.name}</td>
    <td>${item.category || "-"}</td>
    <td>${item.unit || "-"}</td>
    <td>${item.supplier || "-"}</td>
    <td>${minStock}</td>
    <td>${stock}</td>
    <td>${item.location || "-"}</td>
    <td><span class="badge ${badgeClass}">${statusText}</span></td>
    <td>
      <button class="btn" onclick="editItem('${item.code}')">Edit</button>
      <button class="btn" style="background:#dc2626;" onclick="deleteItem('${item.code}')">Delete</button>
    </td>
  `;
}

async function deleteItem(code) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/items?code=eq.${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    alert("Failed to delete item");
    return;
  }

  alert("Item deleted");
  location.reload();
}

function editItem(code) {
  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const item = items.find(i => i.code === code);
  if (!item) return;

  document.getElementById("itemCode").value = item.code;
  document.getElementById("itemName").value = item.name;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("itemUnit").value = item.unit || "Piece";
  document.getElementById("itemSupplier").value = item.supplier || "Other";
  document.getElementById("itemMinStock").value = item.minStock || "";
  document.getElementById("itemStock").value = item.stock;
  document.getElementById("itemLocation").value = item.location || "";
  document.getElementById("itemDescription").value = item.description || "";

  items = items.filter(i => i.code !== code);
  localStorage.setItem("estock_items", JSON.stringify(items));
  addItem();
}

function clearItemForm() {
  ["itemCode","itemName","itemMinStock","itemStock","itemLocation","itemDescription"].forEach(id => {
    if (document.getElementById(id)) document.getElementById(id).value = "";
  });
}

/* CATEGORIES */

function addCategory() {
  document.getElementById("categoryModal").style.display = "block";
}

function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none";
}

async function saveCategory() {
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  if (!name) {
    alert("Please enter category name");
    return;
  }

  const response = await cloudInsert("categories", {
    name: name,
    description: description
  });

  if (!response.ok) {
    alert("Failed to save category. It may already exist.");
    return;
  }

  alert("Category saved to cloud");
  location.reload();
}

function addCategoryToTable(category, index) {
  const table = document.querySelector("#categoriesTable tbody");
  if (!table) return;

  const row = table.insertRow();

  row.innerHTML = `
    <td>${index}</td>
    <td>${category.name}</td>
    <td>${category.description || "-"}</td>
    <td>
      <button class="btn" style="background:#dc2626;" onclick="deleteCategory('${category.name}')">
        Delete
      </button>
    </td>
  `;
}

async function deleteCategory(name) {
  if (!confirm("Delete this category?")) return;

  const response = await cloudDelete(
    "categories",
    `name=eq.${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    alert("Failed to delete category");
    return;
  }

  alert("Category deleted");
  location.reload();
}

function searchCategories() {
  const input = document.getElementById("searchCategory").value.toLowerCase();
  const rows = document.querySelectorAll("#categoriesTable tbody tr");

  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}

async function loadCategoriesFromSupabase() {
  const table = document.querySelector("#categoriesTable tbody");
  if (!table) return;

  table.innerHTML = "";

  const categories = await cloudGet("categories", "select=*&order=id.asc");

  categories.forEach((cat, index) => {
    addCategoryToTable(cat, index + 1);
  });
}

/* SUPPLIERS */

function addSupplier() {
  document.getElementById("supplierModal").style.display = "block";
}

function closeSupplierModal() {
  document.getElementById("supplierModal").style.display = "none";
}

function saveSupplier() {
  const name = document.getElementById("supplierName").value.trim();
  const contact = document.getElementById("supplierContact").value.trim();
  const phone = document.getElementById("supplierPhone").value.trim();
  const email = document.getElementById("supplierEmail").value.trim();
  const address = document.getElementById("supplierAddress").value.trim();

  if (!name) {
    alert("Please enter supplier name");
    return;
  }

  let suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
  suppliers.push({ name, contact, phone, email, address });
  localStorage.setItem("estock_suppliers", JSON.stringify(suppliers));
  location.reload();
}

function addSupplierToTable(supplier, index) {
  const table = document.querySelector("#suppliersTable tbody");
  const row = table.insertRow();

  row.innerHTML = `
    <td>${index}</td>
    <td>${supplier.name}</td>
    <td>${supplier.contact || "-"}</td>
    <td>${supplier.phone || "-"}</td>
    <td>${supplier.email || "-"}</td>
    <td><button class="btn" style="background:#dc2626;" onclick="deleteSupplier('${supplier.name}')">Delete</button></td>
  `;
}

function deleteSupplier(name) {
  if (!confirm("Delete this supplier?")) return;
  let suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
  suppliers = suppliers.filter(sup => sup.name !== name);
  localStorage.setItem("estock_suppliers", JSON.stringify(suppliers));
  location.reload();
}

function searchSuppliers() {
  const input = document.getElementById("searchSupplier").value.toLowerCase();
  const rows = document.querySelectorAll("#suppliersTable tbody tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}

/* STOCK IN */

function openStockIn() {
  document.getElementById("stockInModal").style.display = "block";
  loadStockInDropdowns();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("stockInDate").value = today;

  const records = JSON.parse(localStorage.getItem("estock_stock_in")) || [];
  document.getElementById("grnNo").value =
    "GRN-" + new Date().getFullYear() + "-" + String(records.length + 1).padStart(4, "0");
}

function closeStockIn() {
  document.getElementById("stockInModal").style.display = "none";
}

function loadStockInDropdowns() {
  const supplierSelect = document.getElementById("stockInSupplier");
  const itemSelect = document.getElementById("stockInItem");

  if (supplierSelect) supplierSelect.innerHTML = "";
  if (itemSelect) itemSelect.innerHTML = "";

  const suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  if (supplierSelect) {
    suppliers.forEach(supplier => {
      supplierSelect.innerHTML += `<option value="${supplier.name}">${supplier.name}</option>`;
    });
  }

  if (itemSelect) {
    itemSelect.innerHTML = `<option value="">Select Item</option>`;

    items.forEach(item => {
      itemSelect.innerHTML += `
        <option value="${item.code}">
          ${item.code} - ${item.name} | Balance: ${item.stock}
        </option>
      `;
    });
  }
}

function saveStockIn() {
  const grn = document.getElementById("grnNo").value;
  const date = document.getElementById("stockInDate").value;
  const supplier = document.getElementById("stockInSupplier").value;
  const itemCode = document.getElementById("stockInItem").value;
  const qty = Number(document.getElementById("stockInQty").value);
  const cost = Number(document.getElementById("stockInCost").value);
  const remarks = document.getElementById("stockInRemarks").value;

  if (!itemCode || !qty) {
    alert("Please select item and enter quantity");
    return;
  }

  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const item = items.find(i => i.code === itemCode);

  if (!item) {
    alert("Item not found");
    return;
  }

  item.stock = Number(item.stock) + qty;
  item.status = Number(item.stock) <= Number(item.minStock || 5) ? "Low" : "Available";
  localStorage.setItem("estock_items", JSON.stringify(items));

  let stockIn = JSON.parse(localStorage.getItem("estock_stock_in")) || [];
  stockIn.push({
    grn,
    date,
    supplier,
    itemCode,
    itemName: item.name,
    qty,
    cost,
    total: qty * cost,
    remarks
  });
  localStorage.setItem("estock_stock_in", JSON.stringify(stockIn));

  closeStockIn();
  location.reload();
}

function addStockInToTable(record) {
  const table = document.querySelector("#stockInTable tbody");
  const row = table.insertRow();

  row.innerHTML = `
    <td>${record.grn}</td>
    <td>${record.date}</td>
    <td>${record.supplier}</td>
    <td>${record.itemName}</td>
    <td>${record.qty}</td>
    <td>${record.cost}</td>
    <td>${record.total}</td>
    <td>${record.remarks || "-"}</td>
  `;
}

/* STOCK OUT */

function openStockOut() {
  document.getElementById("stockOutModal").style.display = "block";
  loadStockOutDropdown();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("stockOutDate").value = today;

  const records = JSON.parse(localStorage.getItem("estock_stock_out")) || [];
  document.getElementById("issueNo").value =
    "ISS-" + new Date().getFullYear() + "-" + String(records.length + 1).padStart(4, "0");
}

function closeStockOut() {
  document.getElementById("stockOutModal").style.display = "none";
}

function loadStockOutDropdown() {
  const itemSelect = document.getElementById("stockOutItem");
  itemSelect.innerHTML = "";

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  items.forEach(item => {
    itemSelect.innerHTML += `<option value="${item.code}">${item.code} - ${item.name} | Balance: ${item.stock}</option>`;
  });
}

function saveStockOut() {
  const issueNo = document.getElementById("issueNo").value;
  const date = document.getElementById("stockOutDate").value;
  const department = document.getElementById("stockOutDepartment").value;
  const itemCode = document.getElementById("stockOutItem").value;
  const qty = Number(document.getElementById("stockOutQty").value);
  const purpose = document.getElementById("stockOutPurpose").value;
  const remarks = document.getElementById("stockOutRemarks").value;

  if (!itemCode || !qty) {
    alert("Please select item and enter quantity");
    return;
  }

  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const item = items.find(i => i.code === itemCode);

  if (!item) {
    alert("Item not found");
    return;
  }

  if (qty > Number(item.stock)) {
    alert("Not enough stock available");
    return;
  }

  item.stock = Number(item.stock) - qty;
  item.status = Number(item.stock) <= Number(item.minStock || 5) ? "Low" : "Available";
  localStorage.setItem("estock_items", JSON.stringify(items));

  let stockOut = JSON.parse(localStorage.getItem("estock_stock_out")) || [];
  stockOut.push({
    issueNo,
    date,
    department,
    itemCode,
    itemName: item.name,
    qty,
    purpose,
    remarks
  });
  localStorage.setItem("estock_stock_out", JSON.stringify(stockOut));

  closeStockOut();
  location.reload();
}

function addStockOutToTable(record) {
  const table = document.querySelector("#stockOutTable tbody");
  const row = table.insertRow();

  row.innerHTML = `
    <td>${record.issueNo}</td>
    <td>${record.date}</td>
    <td>${record.department}</td>
    <td>${record.itemName}</td>
    <td>${record.qty}</td>
    <td>${record.purpose || "-"}</td>
    <td>${record.remarks || "-"}</td>
  `;
}

/* DASHBOARD */

function loadDashboardStats() {

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const requests = JSON.parse(localStorage.getItem("estock_requests")) || [];

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  const lowStock = items.filter(item =>
    Number(item.stock || 0) <= Number(item.minStock || 5)
  ).length;

  if (document.getElementById("pendingRequests"))
    document.getElementById("pendingRequests").textContent = pending;

  if (document.getElementById("approvedRequests"))
    document.getElementById("approvedRequests").textContent = approved;

  if (document.getElementById("rejectedRequests"))
    document.getElementById("rejectedRequests").textContent = rejected;

  if (document.getElementById("lowStockItems"))
    document.getElementById("lowStockItems").textContent = lowStock;
}

/* REPORTS */

function showStockBalanceReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Stock Balance Report";

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  let html = `<table><thead><tr>
    <th>Code</th><th>Item</th><th>Category</th><th>Unit</th><th>Supplier</th><th>Balance</th><th>Status</th>
  </tr></thead><tbody>`;

  items.forEach(item => {
    html += `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.unit || "-"}</td>
      <td>${item.supplier || "-"}</td>
      <td>${item.stock}</td>
      <td>${item.status}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;
}

function showStockInReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Stock In Report";

  const fromDate = document.getElementById("reportFromDate")?.value;
  const toDate = document.getElementById("reportToDate")?.value;

  let records = JSON.parse(localStorage.getItem("estock_stock_in")) || [];

  if (fromDate && toDate) {
    records = records.filter(r => r.date >= fromDate && r.date <= toDate);
  }

  let totalQty = 0;
  let totalValue = 0;

  let html = `<div style="margin-bottom:15px;">
    <strong>Total Records:</strong> ${records.length} |
    <strong>Total Quantity:</strong> <span id="stockInTotalQty">0</span> |
    <strong>Total Value:</strong> MVR <span id="stockInTotalValue">0</span>
  </div>`;

  html += `<table><thead><tr>
    <th>GRN</th><th>Date</th><th>Supplier</th><th>Item</th><th>Qty</th><th>Total</th>
  </tr></thead><tbody>`;

  records.forEach(r => {
    totalQty += Number(r.qty || 0);
    totalValue += Number(r.total || 0);

    html += `<tr>
      <td>${r.grn}</td>
      <td>${r.date}</td>
      <td>${r.supplier}</td>
      <td>${r.itemName}</td>
      <td>${r.qty}</td>
      <td>${r.total}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;

  document.getElementById("stockInTotalQty").innerText = totalQty;
  document.getElementById("stockInTotalValue").innerText = totalValue.toFixed(2);
}

function showStockOutReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Stock Out Report";

  const fromDate = document.getElementById("reportFromDate")?.value;
  const toDate = document.getElementById("reportToDate")?.value;

  let records = JSON.parse(localStorage.getItem("estock_stock_out")) || [];

  if (fromDate && toDate) {
    records = records.filter(r => r.date >= fromDate && r.date <= toDate);
  }

  let totalQty = 0;

  let html = `<div style="margin-bottom:15px;">
    <strong>Total Records:</strong> ${records.length} |
    <strong>Total Quantity Issued:</strong> <span id="stockOutTotalQty">0</span>
  </div>`;

  html += `<table><thead><tr>
    <th>Issue No</th><th>Date</th><th>Issued To</th><th>Item</th><th>Qty</th><th>Purpose</th>
  </tr></thead><tbody>`;

  records.forEach(r => {
    totalQty += Number(r.qty || 0);

    html += `<tr>
      <td>${r.issueNo}</td>
      <td>${r.date}</td>
      <td>${r.department}</td>
      <td>${r.itemName}</td>
      <td>${r.qty}</td>
      <td>${r.purpose || "-"}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;

  document.getElementById("stockOutTotalQty").innerText = totalQty;
}

function showLowStockReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Low Stock Report";

  const items = JSON.parse(localStorage.getItem("estock_items")) || [];
  const lowItems = items.filter(item => Number(item.stock) <= Number(item.minStock || 5));

  let html = `<table><thead><tr>
    <th>Code</th><th>Item</th><th>Minimum</th><th>Balance</th><th>Status</th>
  </tr></thead><tbody>`;

  lowItems.forEach(item => {
    html += `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.minStock || 5}</td>
      <td>${item.stock}</td>
      <td>Low</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;
}

function setReportDate() {
  const el = document.getElementById("reportDate");
  if (el) {
    el.innerText = "Generated: " + new Date().toLocaleString();
  }
}

function exportReportCSV() {
  const table = document.querySelector("#reportContent table");

  if (!table) {
    alert("Please select a report first");
    return;
  }

  let csv = [];
  const rows = table.querySelectorAll("tr");

  rows.forEach(row => {
    const cols = row.querySelectorAll("th, td");
    const rowData = [];
    cols.forEach(col => rowData.push('"' + col.innerText.replace(/"/g, '""') + '"'));
    csv.push(rowData.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "E-Stock-Report.csv";
  link.click();
}

function loadItemCategories() {
  const select = document.getElementById("itemCategory");
  if (!select) return;

  const categories = JSON.parse(localStorage.getItem("estock_categories")) || [];

  select.innerHTML = `<option value="">Select Category</option>`;

  categories.forEach(cat => {
    select.innerHTML += `<option>${cat.name}</option>`;
  });
}

function loadItemSuppliers() {
  const select = document.getElementById("itemSupplier");
  if (!select) return;

  const suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];

  select.innerHTML = `<option value="">Select Supplier</option>`;

  suppliers.forEach(sup => {
    select.innerHTML += `<option>${sup.name}</option>`;
  });
}

/* PAGE LOAD */

window.addEventListener("load", function () {
  const itemsTable = document.getElementById("itemsTable");
  if (itemsTable) {
    const items = JSON.parse(localStorage.getItem("estock_items")) || [];
    items.forEach(item => addItemToTable(item));
  }

  const categoriesTable = document.getElementById("categoriesTable");
if (categoriesTable) {
  loadCategoriesFromSupabase();
}

  const suppliersTable = document.getElementById("suppliersTable");
  if (suppliersTable) {
    const suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
    suppliers.forEach((sup, index) => addSupplierToTable(sup, index + 1));
  }

  const stockInTable = document.getElementById("stockInTable");
  if (stockInTable) {
    const stockIn = JSON.parse(localStorage.getItem("estock_stock_in")) || [];
    stockIn.forEach(record => addStockInToTable(record));
  }

  const stockOutTable = document.getElementById("stockOutTable");
  if (stockOutTable) {
    const stockOut = JSON.parse(localStorage.getItem("estock_stock_out")) || [];
    stockOut.forEach(record => addStockOutToTable(record));
  }

  loadDashboardStats();
});
function backupData() {

  const backup = {
    items: JSON.parse(localStorage.getItem("estock_items")) || [],
    categories: JSON.parse(localStorage.getItem("estock_categories")) || [],
    suppliers: JSON.parse(localStorage.getItem("estock_suppliers")) || [],
    stockIn: JSON.parse(localStorage.getItem("estock_stock_in")) || [],
    stockOut: JSON.parse(localStorage.getItem("estock_stock_out")) || [],
    requests: JSON.parse(localStorage.getItem("estock_requests")) || [],
    adjustments: JSON.parse(localStorage.getItem("estock_adjustments")) || [],
    backupDate: new Date().toISOString()
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download =
    "E-STOCK-BACKUP-" +
    new Date().toISOString().split("T")[0] +
    ".json";

  a.click();
}

function restoreData(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    const backup = JSON.parse(e.target.result);

    localStorage.setItem(
      "estock_items",
      JSON.stringify(backup.items || [])
    );

    localStorage.setItem(
      "estock_categories",
      JSON.stringify(backup.categories || [])
    );

    localStorage.setItem(
      "estock_suppliers",
      JSON.stringify(backup.suppliers || [])
    );

    localStorage.setItem(
      "estock_stock_in",
      JSON.stringify(backup.stockIn || [])
    );

    localStorage.setItem(
      "estock_stock_out",
      JSON.stringify(backup.stockOut || [])
    );

    localStorage.setItem(
      "estock_requests",
      JSON.stringify(backup.requests || [])
    );

    localStorage.setItem(
      "estock_adjustments",
      JSON.stringify(backup.adjustments || [])
    );

    alert("Backup restored successfully");

    location.reload();
  };

  reader.readAsText(file);
}


function logout() {
  localStorage.removeItem("estock_logged_user");
}

function checkLogin() {
  const loggedUser = localStorage.getItem("estock_logged_user");
  const isLoginPage = window.location.pathname.includes("login.html");

  if (!loggedUser && !isLoginPage) {
    if (window.location.pathname.includes("/pages/")) {
      window.location.href = "../login.html";
    } else {
      window.location.href = "login.html";
    }
  }
}

function applyRolePermissions() {
  const user = JSON.parse(localStorage.getItem("estock_logged_user"));

  if (!user) return;

  const role = user.role;

  document.querySelectorAll("[data-role]").forEach(el => {
    const allowedRoles = el.getAttribute("data-role").split(",");

    if (!allowedRoles.includes(role)) {
      el.style.display = "none";
    }
  });
}

window.addEventListener("load", function () {
  checkLogin();
  applyRolePermissions();
});
function blockPageByRole() {
  const storedUser = localStorage.getItem("estock_logged_user");
  if (!storedUser) return;

  const user = JSON.parse(storedUser);
  const role = user.role;
  const path = window.location.pathname;

  const rules = [
    { page: "users.html", roles: ["Admin"] },
    { page: "items.html", roles: ["Admin", "Store Keeper"] },
    { page: "categories.html", roles: ["Admin", "Store Keeper"] },
    { page: "suppliers.html", roles: ["Admin", "Store Keeper"] },
    { page: "stock-in.html", roles: ["Admin", "Store Keeper"] },
    { page: "stock-out.html", roles: ["Admin", "Store Keeper"] },
    { page: "adjustments.html", roles: ["Admin", "Store Keeper"] },
    { page: "reports.html", roles: ["Admin", "Secretary General", "Store Keeper", "Viewer"] }
  ];

  const rule = rules.find(r => path.includes(r.page));

  if (rule && !rule.roles.includes(role)) {
    alert("Access denied");
    window.location.href = path.includes("/pages/")
      ? "../dashboard.html"
      : "dashboard.html";
  }
}

window.addEventListener("load", blockPageByRole);