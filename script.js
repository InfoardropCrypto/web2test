var firebaseConfig = {
  apiKey: "AIzaSyBtoafs5RAPyMYO4VwIWEMb98Ye_X0w-EA",
  authDomain: "web3-iac.firebaseapp.com",
  databaseURL: "https://web3-iac-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web3-iac",
  storageBucket: "web3-iac.firebasestorage.app",
  messagingSenderId: "177980099871",
  appId: "1:177980099871:web:9ecb0cc57ac00b757c342a",
  measurementId: "G-9VG2WXG47T"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const themeToggle = document.getElementById("themeToggle");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const authSection = document.getElementById("authSection");
const postMessageSection = document.getElementById("postMessageSection");
const profileButton = document.getElementById("profileButton");
const profileMenu = document.getElementById("profileMenu");
const profileEmail = document.getElementById("profileEmail");
const feed = document.getElementById("feed");
const mainContent = document.getElementById("mainContent");
const leaderboard = document.getElementById("leaderboard");
const homeBtn = document.getElementById("homeBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");

let themeMode = localStorage.getItem("themeMode") || "auto";

function applyTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.innerText = "☀️";
  } else if (mode === "light") {
    document.body.classList.remove("dark-mode");
    themeToggle.innerText = "🌙";
  } else if (mode === "auto") {
    const hour = new Date().getHours();
    const isDarkTime = hour >= 18 || hour < 7;
    if (isDarkTime) {
      document.body.classList.add("dark-mode");
      themeToggle.innerText = "☀️";
    } else {
      document.body.classList.remove("dark-mode");
      themeToggle.innerText = "🌙";
    }
  }
}

if (themeToggle) {
  applyTheme(themeMode);

  themeToggle.addEventListener("click", () => {
    if (themeMode === "light") {
      themeMode = "dark";
    } else if (themeMode === "dark") {
      themeMode = "auto";
    } else {
      themeMode = "light";
    }
    localStorage.setItem("themeMode", themeMode);
    applyTheme(themeMode);
  });
}

function applyTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.innerText = "☀️";
  } else if (mode === "light") {
    document.body.classList.remove("dark-mode");
    themeToggle.innerText = "🌙";
  } else if (mode === "auto") {
    const hour = new Date().getHours();
    const isDarkTime = hour >= 18 || hour < 7;
    if (isDarkTime) {
      document.body.classList.add("dark-mode");
      themeToggle.innerText = "☀️";
    } else {
      document.body.classList.remove("dark-mode");
      themeToggle.innerText = "🌙";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const userPref = localStorage.getItem("theme");
  if (!userPref) {
    applyAutoTheme();
  } else {
    const isDark = userPref === "dark";
    if (isDark) {
      document.body.classList.add("dark-mode");
      if (themeToggle) themeToggle.innerText = "☀️";
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggle) themeToggle.innerText = "🌙";
    }
  }
});

if (profileButton) {
  profileButton.addEventListener("click", toggleProfileMenu);
}

auth.onAuthStateChanged(user => {
    if (user) {
        if (authSection) authSection.style.display = "none";

        if (postMessageSection) {
  postMessageSection.style.display = "flex";
}

        profileButton.style.display = "block";
        document.getElementById("profileMenu").style.display = "none";
        
        database.ref(`users/${user.uid}`).on("value", snapshot => {
            const userData = snapshot.val();
            if (userData) {
                profileEmail.innerText = userData.displayName || userData.email;
                const avatar = `<img src="${userData.profilePictureURL || 'img/profil_1.png'}" alt="Profil" class="avatar">`;
                profileButton.innerHTML = avatar;
            }
        });
        loadFeed();
    } else {
        if (authSection) authSection.style.display = "block";
        if (postMessageSection) postMessageSection.style.display = "flex";

        profileButton.style.display = "none";
        profileMenu.style.display = "none";
        feed.innerHTML = "";
        mainContent.style.display = "block";
        leaderboard.style.display = "none";
    }
});

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
      .catch(error => alert(error.message));
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
      .then(userCredential => {
        const uid = userCredential.user.uid;
        const defaultEmail = userCredential.user.email;
        return database.ref(`users/${uid}`).set({
          email: defaultEmail,
          displayName: "",
          bio: "",
          profilePictureURL: "",
          xp: 0,
          level: 1,
          badge: "😀"
        });
      })
      .then(() => {
        const displayNameInput = document.getElementById("displayNameInput");
        const profileModal = document.getElementById("profileModal");
        const postMessageSection = document.getElementById("postMessageSection");
        const profileMenu = document.getElementById("profileMenu");

        if (displayNameInput) displayNameInput.value = "";
        if (profileModal) profileModal.style.display = "block";
        if (postMessageSection) postMessageSection.style.display = "none";
        if (profileMenu) profileMenu.style.display = "none";

        alert("Selamat datang! Silakan lengkapi profil terlebih dahulu.");
      })
      .catch(error => alert(error.message));
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (confirm("Yakin ingin logout?")) {
      auth.signOut();
    }
  });
}

if (homeBtn) { 
  homeBtn.addEventListener("click", () => {
    mainContent.style.display = "block";
    leaderboard.style.display = "none";
});
}

if (leaderboardBtn) { 
  leaderboardBtn.addEventListener("click", () => {
    mainContent.style.display = "none";
    leaderboard.style.display = "block";
    updateLeaderboard();
});
}

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    database.ref(`users/${user.uid}`).once("value").then(snapshot => {
        const userData = snapshot.val();
        document.getElementById("displayNameInput").value = userData.displayName || '';
        document.getElementById("profileModal").style.display = "block";
        profileMenu.style.display = "none";
        document.getElementById("bioInput").value = userData.bio || '';

    });
});
}

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  const displayName = document.getElementById("displayNameInput")?.value.trim();
  const bio = document.getElementById("bioInput")?.value.trim();
  const profilePictureURL = document.getElementById("profilePictureURLInput")?.value.trim();

  if (user) {
    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (profilePictureURL.startsWith("https://")) updates.profilePictureURL = profilePictureURL;

    database.ref(`users/${user.uid}`).update(updates)
      .then(() => {
        closeProfile();
        if (postMessageSection) postMessageSection.style.display = "flex";
      });
  }
});

}

function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
}

document.getElementById("postMessageBtn").addEventListener("click", () => {
    const content = document.getElementById("postMessageContent").value.trim();
    if (content) {
        const user = auth.currentUser;
        const xpGain = Math.floor(Math.random() * (35 - 15 + 1)) + 15;

        database.ref("postsMessages").push().set({
            content: content,
            user: user.email,
            uid: user.uid,
            timestamp: new Date().toLocaleString("id-ID"),
            likesCount: 0
        });

        const userRef = database.ref(`users/${user.uid}`);
        userRef.transaction(userData => {
            if (userData) {
                userData.xp = (userData.xp || 0) + xpGain;
                const xpRequired = userData.level <= 5 ? 500 : 1200;
                if (userData.xp >= xpRequired) {
                    userData.xp -= xpRequired;
                    userData.level++;
                }
                if (userData.level >= 15) userData.badge = "😈";
                else if (userData.level >= 5) userData.badge = "😁";
            }
            return userData;
        });
        document.getElementById("postMessageContent").value = "";
        alert("✅ Postingan terkirim!");

    }
});

function loadFeed() {
    const postsRef = database.ref("postsMessages").orderByChild("timestamp");
    postsRef.on("value", snapshot => {
    if (isSearching) return;

    feed.innerHTML = "";
    let posts = [];
    snapshot.forEach(child => {
        posts.push({ key: child.key, val: child.val() });
    });
    posts.reverse().forEach(post => displayPost(post.key, post.val));
});

}

function displayPost(postId, data) {
    const element = document.createElement("div");
    element.classList.add("message");
    const user = auth.currentUser;

    database.ref(`users/${data.uid}`).once('value').then(userSnap => {
        const authorData = userSnap.val() || {};
        const authorName = authorData.displayName || data.user;
        const authorAvatar = authorData.profilePictureURL || 'img/profil_1.png';

        element.innerHTML = `
            <div class="post-header">
                <img src="${authorAvatar}" alt="Avatar" class="post-avatar">
                <strong>
  <a href="profile.html?id=${data.uid}" class="clickable" style="color:black;">
    ${authorName} ${authorData.badge || "😀"}
  </a>
</strong>

            </div>
            <p id="content-${postId}" class="editable-content">
  ${autoLink(data.content)}${data.edited ? " <span class='edited-tag'>(diedit)</span>" : ""}
</p>

            <span class='timestamp'>(${data.timestamp})</span>
        `;
        
        const actions = document.createElement("div");
        createLikeButton(actions, `postsMessages/${postId}`);
        
        if (user && user.uid === data.uid) {
            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.onclick = () => toggleEdit(postId, data.content, 'postsMessages');
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Hapus";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.onclick = () => database.ref(`postsMessages/${postId}`).remove();
            actions.appendChild(deleteBtn);
        }
        element.appendChild(actions);

        const repliesContainer = document.createElement("div");
        repliesContainer.classList.add("replies");
        loadReplies(postId, repliesContainer);

        element.appendChild(repliesContainer);
        element.appendChild(createReplyInput(postId));
        feed.appendChild(element);
    });
    
}

function createReplyInput(postId) {
    const user = auth.currentUser;
    const container = document.createElement("div");
    container.className = "reply-input-container";
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Tulis balasan...";
    input.className = "reply-input";

    const button = document.createElement("button");
    button.innerText = "Balas";
    button.className = "reply-button";
    button.onclick = () => {
        if (input.value.trim()) {
            database.ref(`postsMessages/${postId}/replies`).push().set({
                content: input.value.trim(),
                user: user.email,
                uid: user.uid,
                timestamp: new Date().toLocaleString("id-ID"),
                likesCount: 0
            });
            input.value = "";
        }
    };
    container.appendChild(input);
    container.appendChild(button);
    return container;
}

function loadReplies(postId, container) {
    database.ref(`postsMessages/${postId}/replies`).on("value", snapshot => {
        container.innerHTML = "";
        snapshot.forEach(child => displayReply(container, postId, child.key, child.val()));
    });
}

function displayReply(container, postId, replyId, data) {
    const replyElement = document.createElement("div");
    replyElement.classList.add("reply");
    const user = auth.currentUser;

    database.ref(`users/${data.uid}`).once('value').then(userSnap => {
        const authorData = userSnap.val() || {};
        const authorName = authorData.displayName || data.user;

        replyElement.innerHTML = `<p><strong>${authorName}:</strong> 
  <span id="content-${replyId}">${autoLink(data.content)}${data.edited ? " <span class='edited-tag'>(diedit)</span>" : ""}
</span></p>`;

        const actions = document.createElement("div");
        createLikeButton(actions, `postsMessages/${postId}/replies/${replyId}`);
        
        if (user && user.uid === data.uid) {
            const editBtn = document.createElement("button");
            editBtn.innerText = "Edit";
            editBtn.onclick = () => toggleEdit(replyId, data.content, `postsMessages/${postId}/replies`);
            actions.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Hapus";
            deleteBtn.onclick = () => database.ref(`postsMessages/${postId}/replies/${replyId}`).remove();
            actions.appendChild(deleteBtn);
        }
        replyElement.appendChild(actions);
        container.appendChild(replyElement);
    });
}

function toggleEdit(id, currentContent, path) {
    const contentElement = document.getElementById(`content-${id}`);
    if (contentElement.querySelector('textarea')) return;

    contentElement.innerHTML = `
        <textarea style="width:100%">${currentContent}</textarea>
        <button onclick="saveEdit('${id}', '${path}')">Simpan</button>
        <button onclick="cancelEdit('${id}', '${currentContent}')">Batal</button>
    `;
}

function saveEdit(id, path) {
    const newContent = document.querySelector(`#content-${id} textarea`).value;
    database.ref(`${path}/${id}`).update({ 
        content: newContent,
        edited: true
    });
}

function cancelEdit(id, originalContent) {
    document.getElementById(`content-${id}`).innerHTML = `${autoLink(originalContent)} <span class='edited-tag'>(diedit)</span>`;
}

function createLikeButton(container, dbPath) {
    const user = auth.currentUser;
    if (!user) return;

    const likeBtn = document.createElement("button");
    likeBtn.innerText = "❤️ Suka";
    likeBtn.classList.add("like-btn");
    const likeText = document.createElement("span");
    likeBtn.appendChild(likeText);
    
    const likeCountRef = database.ref(`${dbPath}/likesCount`);
    const userLikeRef = database.ref(`${dbPath}/likes/${user.uid}`);

    likeCountRef.on("value", snap => { likeText.innerText = ` (${snap.val() || 0})`; });
    userLikeRef.on("value", snap => { likeBtn.classList.toggle("liked", snap.exists()); });

    likeBtn.onclick = () => {
        database.ref(dbPath).transaction(data => {
            if (data) {
                if (!data.likes) {
                    data.likes = {};
                }
                if (data.likes[user.uid]) {

                    data.likesCount--;
                    data.likes[user.uid] = null;
                } else {

                    data.likesCount = (data.likesCount || 0) + 1;
                    data.likes[user.uid] = true;
                }
            }
            return data;
        });
    };
    container.appendChild(likeBtn);
}
function updateLeaderboard() {
    database.ref("users").orderByChild("level").limitToLast(10).on("value", snapshot => {
        const leaderboardList = document.getElementById("leaderboardList");
        leaderboardList.innerHTML = "Memuat...";
        let users = [];
        snapshot.forEach(child => users.push(child.val()));
        
        users.sort((a, b) => b.level - a.level || b.xp - a.xp);
        leaderboardList.innerHTML = "";

        users.forEach(user => {
            const li = document.createElement("li");
            const displayName = user.displayName || user.email.split('@')[0];
            const avatar = user.profilePictureURL || 'img/profil_1.png';
            li.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <img src="${avatar}" class="leaderboard-avatar">
                    <span>${displayName}</span>
                </div>
                <span>Level: ${user.level} (XP: ${user.xp})</span>
            `;
            leaderboardList.appendChild(li);
        });
    });
}

function autoLink(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function toggleProfileMenu() {
    profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
}

let isSearching = false;

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const keyword = this.value.toLowerCase();
    if (keyword === '') {
  isSearching = false;
  loadFeed();
} else {
  isSearching = true;
  document.querySelectorAll('.message').forEach(msg => {
    msg.style.display = msg.innerText.toLowerCase().includes(keyword) ? '' : 'none';
  });
}

  });
}

document.addEventListener("click", (e) => {
  if (profileButton && profileMenu && !profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
    profileMenu.style.display = "none";
  }
});

function applyAutoTheme() {
  const now = new Date();
  const hour = now.getHours();
  const isDarkTime = hour >= 18 || hour < 7;

  if (isDarkTime) {
    document.body.classList.add("dark-mode");
    if (themeToggle) themeToggle.innerText = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    if (themeToggle) themeToggle.innerText = "🌙";
    localStorage.setItem("theme", "light");
  }
}
