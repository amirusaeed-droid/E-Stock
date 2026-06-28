let editingUserId = null;

function openUserModal() {
  editingUserId = null;

  document.getElementById("userModal").style.display = "block";

  document.getElementById("fullName").value = "";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("role").value = "";
  document.getElementById("status").value = "Active";
}

function closeUserModal() {
  document.getElementById("userModal").style.display = "none";
}

async function saveUser() {
  const fullName = document.getElementById("fullName").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;

  if (!fullName || !username || !role) {
    alert("Please fill full name, username and role");
    return;
  }

  if (!editingUserId && !password) {
    alert("Please enter password");
    return;
  }

  if (editingUserId) {
    const updateData = {
      full_name: fullName,
      username: username,
      role: role,
      status: status
    };

    if (password) {
      updateData.password = password;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${editingUserId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      alert("Failed to update user");
      return;
    }

    alert("User updated successfully");
    location.reload();
    return;
  }

  const newUser = {
    full_name: fullName,
    username: username,
    password: password,
    role: role,
    status: status
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(newUser)
  });

  if (!response.ok) {
    alert("Failed to save user. Username may already exist.");
    return;
  }

  alert("User saved successfully");
  location.reload();
}

async function loadUsers() {
  const table = document.querySelector("#usersTable tbody");
  if (!table) return;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&order=id.asc`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const users = await response.json();

  table.innerHTML = "";

  users.forEach(user => {
    const statusClass = user.status === "Active" ? "badge-success" : "badge-danger";

    table.innerHTML += `
      <tr>
        <td>${user.username}</td>
        <td>${user.full_name}</td>
        <td>${user.role}</td>
        <td><span class="badge ${statusClass}">${user.status}</span></td>
        <td>
          <button class="btn" type="button" onclick="editUser(${user.id})">Edit</button>
          <button class="btn" type="button" style="background:#7c3aed;" onclick="changePassword(${user.id})">Password</button>
          <button class="btn" type="button" style="background:#dc2626;" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function editUser(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${id}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const users = await response.json();
  const user = users[0];

  if (!user) {
    alert("User not found");
    return;
  }

  editingUserId = user.id;

  document.getElementById("userModal").style.display = "block";

  document.getElementById("fullName").value = user.full_name || "";
  document.getElementById("username").value = user.username || "";
  document.getElementById("password").value = "";
  document.getElementById("role").value = user.role || "";
  document.getElementById("status").value = user.status || "Active";
}

async function changePassword(id) {
  const newPassword = prompt("Enter new password:");

  if (!newPassword) {
    alert("Password not changed");
    return;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({ password: newPassword })
  });

  if (!response.ok) {
    alert("Failed to change password");
    return;
  }

  alert("Password changed successfully");
}

async function deleteUser(id, username) {
  if (username === "admin") {
    alert("Default admin user cannot be deleted");
    return;
  }

  if (!confirm("Delete this user?")) return;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!response.ok) {
    alert("Failed to delete user");
    return;
  }

  alert("User deleted successfully");
  location.reload();
}

window.addEventListener("load", loadUsers);