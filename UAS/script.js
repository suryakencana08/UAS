const base_url = "https://primdev.alwaysdata.net/api"; // URL API
let token = localStorage.getItem("token") || ""; // Ambil token dari localStorage

// Fungsi untuk login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(`${base_url}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("token", data.token);
    window.location.href = "blog.html";
  } else {
    alert("Login failed");
  }
});

// Fungsi untuk registrasi
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const response = await fetch(`${base_url}/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password: confirmPassword,
      }),
    });

    if (response.ok) {
      alert("Registration successful");
      window.location.href = "index.html";
    } else {
      alert("Registration failed ");
    }
  });

// Fungsi untuk menampilkan blog posts di blog.html
async function displayBlogPosts() {
  const response = await fetch(`${base_url}/blog`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const posts = await response.json();
    const blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("blog-post");
      postElement.innerHTML = `
          <img src="${post.image_url}" class="post-image">
          <div class ="article-post">
          <h3>${post.title}</h3>
          <div class = "article-desc">
          <p>${post.content}</p>
          </div>
          <div class = "article-icon">
          <a href="edit.html?id=${post.id}" <i class="bx bx-edit"></i></a>
          <a href="#article"  onclick="deletePost(${post.id})"><i class="bx bx-trash"></i></a>
          </div>
          </div>
      `;
      blogPostsContainer.appendChild(postElement);
    });
  } else {
    alert("Failed to fetch posts");
  }
}

// Fungsi untuk menambah blog post
document.getElementById("blogForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const image = document.getElementById("image").files[0];
  const validFormats = ["image/jpeg", "image/png", "image/webp"];
  if (!validFormats.includes(image.type)) {
    alert("Format gambar tidak didukung.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  formData.append("image", image);

  try {
    const response = await fetch(`${base_url}/blog/store`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Data after post creation:", data);

    if (response.ok) {
      const fullImageUrl = `${base_url}/${data.image_path}`;
      console.log("Post created:", data);

      Swal.fire({
        title: "Berhasil Tambah Blog!",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "blog.html#article";
        }
      });
    } else {
      console.error("Failed response:", data);
      alert(`Failed to create post: ${data.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while creating the post.");
  }
});

/// Event listener untuk form edit
document.getElementById("editForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = new URLSearchParams(window.location.search).get("id");
  const title = document.getElementById("editTitle").value;
  const content = document.getElementById("editContent").value;
  const image = document.getElementById("editImage").files[0];

  const formData = new FormData();
  formData.append("_method", "PUT");
  formData.append("title", title);
  formData.append("content", content);

  try {
    const response = await fetch(`${base_url}/blog/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "Berhasil Update Blog!",
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "blog.html#article";
        }
      });
    } else {
      console.error("Failed response:", data);
      alert(`Failed to update post: ${data.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while updating the post.");
  }
});

// Fungsi untuk menghapus blog post
async function deletePost(id) {
  // Tampilkan dialog konfirmasi
  Swal.fire({
    title: "Apakah Anda yakin?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${base_url}/blog/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          Swal.fire({
            title: "Berhasil!",
            text: "Post berhasil dihapus.",
            icon: "success",
          }).then(() => {
            displayBlogPosts();
            window.location.href = "blog.html#article";
          });
        } else {
          Swal.fire(
            "Gagal!",
            "Terjadi kesalahan saat menghapus post.",
            "error"
          );
        }
      } catch (error) {
        Swal.fire("Kesalahan!", "Tidak dapat terhubung ke server.", "error");
      }
    } else {
      Swal.fire("Dibatalkan", "Penghapusan post dibatalkan.", "info");
    }
  });
}

// Fungsi untuk logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

document.getElementById("logoutButton")?.addEventListener("click", (e) => {
  e.preventDefault();
  Swal.fire({
    title: "Apakah Anda yakin?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, logout!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Berhasil Logout!",
        icon: "success",
      }).then(() => {
        logout();
      });
    }
  });
});

//Fungsi search
document.getElementById("searchInput")?.addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase();
  const response = await fetch(`${base_url}/blog`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const posts = await response.json();
    const blogPostsContainer = document.getElementById("blogPosts");
    blogPostsContainer.innerHTML = "";

    // Filter hasil berdasarkan pencarian
    const filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) || // Filter berdasarkan judul
        post.content.toLowerCase().includes(query) // Filter berdasarkan konten
    );

    if (filteredPosts.length > 0) {
      filteredPosts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("blog-post");
        postElement.innerHTML = `
            <img src="${post.image_url}" class="post-image">
            <div class ="article-post">
            <h3>${post.title}</h3>
            <div class = "article-desc">
            <p>${post.content}</p>
            <div class = "article-icon">
            <a href="edit.html?id=${post.id}" <i class="bx bx-edit"></i></a>
            <a href="#article" onclick="deletePost(${post.id})"><i class="bx bx-trash"></i></a>
            </div>
            </div>
            </div>
        `;
        blogPostsContainer.appendChild(postElement);
      });
    } else {
      blogPostsContainer.innerHTML = "<p>No results found.</p>";
    }
  } else {
    alert("Failed to fetch posts");
  }
});

//script hamburger
const navLinks = document.querySelectorAll(".navbar a");
const check = document.getElementById("check");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    check.checked = false;
  });
});

if (document.getElementById("blogPosts")) {
  displayBlogPosts();
}

//script untuk see all
document.getElementById("seeAll").addEventListener("click", function (event) {
  event.preventDefault();
  const newsItems = document.querySelectorAll(".news-item");
  newsItems.forEach((item) => {
    item.style.display = "block";
  });
  this.style.display = "none";
  document.getElementById("less").style.display = "inline";
});

document.getElementById("less").addEventListener("click", function (event) {
  event.preventDefault();
  const newsItems = document.querySelectorAll(".news-item");
  newsItems.forEach((item, index) => {
    if (index >= 4) {
      item.style.display = "none";
    }
  });
  this.style.display = "none";
  document.getElementById("seeAll").style.display = "inline";
});

//see all dan less crud
document
  .getElementById("seeAll-crud")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const newsItems = document.querySelectorAll(".blog-post");
    newsItems.forEach((item) => {
      item.style.display = "block";
    });
    this.style.display = "none";
    document.getElementById("less-crud").style.display = "inline";
  });

document
  .getElementById("less-crud")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const newsItems = document.querySelectorAll(".blog-post");
    newsItems.forEach((item, index) => {
      if (index >= 8) {
        item.style.display = "none";
      }
    });
    this.style.display = "none";
    document.getElementById("seeAll-crud").style.display = "inline";
  });
