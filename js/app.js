function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "admin" && pass === "admin123") {
    window.location.href = "dashboard.html";
  } else {
    alert("Wrong username or password");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
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
}

function closeModal() {
  document.getElementById("itemModal").style.display = "none";
}

function saveItem() {
  const code = document.getElementById("itemCode").value.trim();
  const name = document.getElementById("itemName").value.trim();
  const category = document.getElementById("itemCategory").value;
  const unit = document.getElementById("itemUnit").value;
  const supplier = document.getElementById("itemSupplier").value;
  const minStock = document.getElementById("itemMinStock").value.trim();
  const stock = document.getElementById("itemStock").value.trim();
  const location = document.getElementById("itemLocation").value.trim();
  const description = document.getElementById("itemDescription").value.trim();

  if (!code || !name || !stock) {
    alert("Please fill all required fields");
    return;
  }

  const item = {
    code, name, category, unit, supplier, minStock, stock, location, description,
    status: Number(stock) <= Number(minStock || 5) ? "Low" : "Available"
  };

  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  items.push(item);
  localStorage.setItem("estock_items", JSON.stringify(items));

  addItemToTable(item);
  clearItemForm();
  closeModal();
}

function addItemToTable(item) {
  const table = document.querySelector("#itemsTable tbody");
  const row = table.insertRow();
  const badgeClass = item.status === "Low" ? "badge-danger" : "badge-success";

  row.innerHTML = `
    <td>${item.code}</td>
    <td>${item.name}</td>
    <td>${item.category}</td>
    <td>${item.unit || "-"}</td>
    <td>${item.supplier || "-"}</td>
    <td>${item.minStock || "-"}</td>
    <td>${item.stock}</td>
    <td>${item.location || "-"}</td>
    <td><span class="badge ${badgeClass}">${item.status}</span></td>
    <td>
      <button class="btn" onclick="editItem('${item.code}')">Edit</button>
      <button class="btn" style="background:#dc2626;" onclick="deleteItem('${item.code}')">Delete</button>
    </td>
  `;
}

function deleteItem(code) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  let items = JSON.parse(localStorage.getItem("estock_items")) || [];
  items = items.filter(item => item.code !== code);
  localStorage.setItem("estock_items", JSON.stringify(items));
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

function saveCategory() {
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  if (!name) {
    alert("Please enter category name");
    return;
  }

  let categories = JSON.parse(localStorage.getItem("estock_categories")) || [];
  categories.push({ name, description });
  localStorage.setItem("estock_categories", JSON.stringify(categories));
  location.reload();
}

function addCategoryToTable(category, index) {
  const table = document.querySelector("#categoriesTable tbody");
  const row = table.insertRow();

  row.innerHTML = `
    <td>${index}</td>
    <td>${category.name}</td>
    <td>${category.description || "-"}</td>
    <td><button class="btn" style="background:#dc2626;" onclick="deleteCategory('${category.name}')">Delete</button></td>
  `;
}

function deleteCategory(name) {
  if (!confirm("Delete this category?")) return;
  let categories = JSON.parse(localStorage.getItem("estock_categories")) || [];
  categories = categories.filter(cat => cat.name !== name);
  localStorage.setItem("estock_categories", JSON.stringify(categories));
  location.reload();
}

function searchCategories() {
  const input = document.getElementById("searchCategory").value.toLowerCase();
  const rows = document.querySelectorAll("#categoriesTable tbody tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(input) ? "" : "none";
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

  supplierSelect.innerHTML = "";
  itemSelect.innerHTML = "";

  const suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
  const items = JSON.parse(localStorage.getItem("estock_items")) || [];

  suppliers.forEach(supplier => {
    supplierSelect.innerHTML += `<option value="${supplier.name}">${supplier.name}</option>`;
  });

  items.forEach(item => {
    itemSelect.innerHTML += `<option value="${item.code}">${item.code} - ${item.name}</option>`;
  });
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
  const categories = JSON.parse(localStorage.getItem("estock_categories")) || [];
  const suppliers = JSON.parse(localStorage.getItem("estock_suppliers")) || [];
  const stockIn = JSON.parse(localStorage.getItem("estock_stock_in")) || [];
  const stockOut = JSON.parse(localStorage.getItem("estock_stock_out")) || [];

  const lowItems = items.filter(item => Number(item.stock) <= Number(item.minStock || 5));

  if (document.getElementById("dashTotalItems")) {
    document.getElementById("dashTotalItems").innerText = items.length;
    document.getElementById("dashLowStock").innerText = lowItems.length;
    document.getElementById("dashSuppliers").innerText = suppliers.length;
    document.getElementById("dashCategories").innerText = categories.length;
  }

  const lowTable = document.getElementById("dashLowStockTable");
  if (lowTable) {
    lowTable.innerHTML = "";
    lowItems.forEach(item => {
      lowTable.innerHTML += `
        <tr>
          <td>${item.code}</td>
          <td>${item.name}</td>
          <td>${item.stock}</td>
          <td><span class="badge badge-danger">Low</span></td>
        </tr>
      `;
    });

    if (lowItems.length === 0) {
      lowTable.innerHTML = `<tr><td colspan="4">No low stock items</td></tr>`;
    }
  }

  const activityBox = document.getElementById("dashRecentActivity");
  if (activityBox) {
    activityBox.innerHTML = "";
    const recent = [];

    stockIn.slice(-3).forEach(r => {
      recent.push({ title: "Stock received", text: `${r.qty} ${r.itemName} received from ${r.supplier}` });
    });

    stockOut.slice(-3).forEach(r => {
      recent.push({ title: "Stock issued", text: `${r.qty} ${r.itemName} issued to ${r.department}` });
    });

    recent.slice(-5).reverse().forEach(a => {
      activityBox.innerHTML += `
        <div class="activity-item">
          <strong>${a.title}</strong>
          <span>${a.text}</span>
        </div>
      `;
    });

    if (recent.length === 0) {
      activityBox.innerHTML = `<div class="activity-item"><strong>No recent activity</strong><span>Stock movements will appear here.</span></div>`;
    }
  }
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
      <td>${item.code}</td><td>${item.name}</td><td>${item.category}</td>
      <td>${item.unit || "-"}</td><td>${item.supplier || "-"}</td>
      <td>${item.stock}</td><td>${item.status}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;
}

function showStockInReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Stock In Report";

  const records = JSON.parse(localStorage.getItem("estock_stock_in")) || [];
  let html = `<table><thead><tr>
    <th>GRN</th><th>Date</th><th>Supplier</th><th>Item</th><th>Qty</th><th>Total</th>
  </tr></thead><tbody>`;

  records.forEach(r => {
    html += `<tr>
      <td>${r.grn}</td><td>${r.date}</td><td>${r.supplier}</td>
      <td>${r.itemName}</td><td>${r.qty}</td><td>${r.total}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;
}

function showStockOutReport() {
  setReportDate();
  document.getElementById("reportTitle").innerText = "Stock Out Report";

  const records = JSON.parse(localStorage.getItem("estock_stock_out")) || [];
  let html = `<table><thead><tr>
    <th>Issue No</th><th>Date</th><th>Issued To</th><th>Item</th><th>Qty</th><th>Purpose</th>
  </tr></thead><tbody>`;

  records.forEach(r => {
    html += `<tr>
      <td>${r.issueNo}</td><td>${r.date}</td><td>${r.department}</td>
      <td>${r.itemName}</td><td>${r.qty}</td><td>${r.purpose || "-"}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("reportContent").innerHTML = html;
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
      <td>${item.code}</td><td>${item.name}</td>
      <td>${item.minStock || 5}</td><td>${item.stock}</td><td>Low</td>
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

/* PAGE LOAD */

window.addEventListener("load", function () {
  const itemsTable = document.getElementById("itemsTable");
  if (itemsTable) {
    const items = JSON.parse(localStorage.getItem("estock_items")) || [];
    items.forEach(item => addItemToTable(item));
  }

  const categoriesTable = document.getElementById("categoriesTable");
  if (categoriesTable) {
    const categories = JSON.parse(localStorage.getItem("estock_categories")) || [];
    categories.forEach((cat, index) => addCategoryToTable(cat, index + 1));
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