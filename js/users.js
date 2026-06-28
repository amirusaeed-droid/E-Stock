function openUserModal() {
  document.getElementById("userModal").style.display = "block";
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

function saveUser() {
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;

  if (!fullName || !username || !password || !role) {
    alert("Please fill all required fields");
    return;
  }

  let users = JSON.parse(localStorage.getItem("estock_users")) || [];

  if (users.some(u => u.username === username)) {
    alert("Username already exists");
    return;
  }

  users.push({ fullName, username, password, role, status });
  localStorage.setItem("estock_users", JSON.stringify(users));

  alert("User saved successfully");
  location.reload();
}

function loadUsers() {
  const table = document.querySelector("#usersTable tbody");
  if (!table) return;

  let users = JSON.parse(localStorage.getItem("estock_users")) || [];

  if (users.length === 0) {
    users.push({
      fullName: "System Administrator",
      username: "admin",
      password: "admin123",
      role: "Admin",
      status: "Active"
    });

    localStorage.setItem("estock_users", JSON.stringify(users));
  }

  table.innerHTML = "";

  users.forEach(user => {
    const statusClass = user.status === "Active" ? "badge-success" : "badge-danger";

    table.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.fullName}</td>
        <td>${user.role}</td>
        <td><span class="badge ${statusClass}">${user.status}</span></td>
        <td>
          <button class="btn" type="button" onclick="editUser('${user.username}')">Edit</button>
          <button class="btn" type="button" style="background:#7c3aed;" onclick="changePassword('${user.username}')">Password</button>
          <button class="btn" type="button" style="background:#dc2626;" onclick="deleteUser('${user.username}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

function editUser(username) {
  let users = JSON.parse(localStorage.getItem("estock_users")) || [];
  const user = users.find(u => u.username === username);

  if (!user) return;

  const fullName = prompt("Full Name:", user.fullName);
  if (fullName === null) return;

  const role = prompt("Role: Admin / Secretary General / Store Keeper / Requester / Viewer", user.role);
  if (role === null) return;

  const status = prompt("Status: Active / Inactive", user.status);
  if (status === null) return;

  user.fullName = fullName.trim() || user.fullName;
  user.role = role.trim() || user.role;
  user.status = status.trim() || user.status;

  localStorage.setItem("estock_users", JSON.stringify(users));
  location.reload();
}

function changePassword(username) {
  let users = JSON.parse(localStorage.getItem("estock_users")) || [];
  const user = users.find(u => u.username === username);

  if (!user) return;

  const newPassword = prompt("Enter new password for " + username + ":");

  if (!newPassword) {
    alert("Password not changed");
    return;
  }

  user.password = newPassword;
  localStorage.setItem("estock_users", JSON.stringify(users));

  alert("Password changed successfully");
}

function deleteUser(username) {
  if (username === "admin") {
    alert("Default admin user cannot be deleted");
    return;
  }

  if (!confirm("Delete this user?")) return;

  let users = JSON.parse(localStorage.getItem("estock_users")) || [];
  users = users.filter(user => user.username !== username);

  localStorage.setItem("estock_users", JSON.stringify(users));
  location.reload();
}

window.addEventListener("load", loadUsers);