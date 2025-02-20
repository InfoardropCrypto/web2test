var firebaseConfig = {
    apiKey: "AIzaSyCtvxvFSXOT0fkRpl84U6LTD8xg8rGWrV8",
    authDomain: "web3-iac-wallet.firebaseapp.com",
    databaseURL: "https://web3-iac-wallet-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "web3-iac-wallet",
    storageBucket: "web3-iac-wallet.firebasestorage.app",
    messagingSenderId: "462702808978",
    appId: "1:462702808978:web:843402ceb14d9eb026bb4b",
    measurementId: "G-H8W6VMJJPH"
  };
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

document.getElementById("signupBtn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        database.ref("users/" + userCredential.user.uid).set({
            email: email,
            xp: 0,
            level: 1
        });
    }).catch(error => alert(error.message));
});

document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password).catch(error => alert(error.message));
});

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("postMessageSection").style.display = "block";
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("authSection").style.display = "none";
    } else {
        document.getElementById("postMessageSection").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
        document.getElementById("signupBtn").style.display = "block";
        document.getElementById("authSection").style.display = "block";
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.signOut();
});

document.getElementById("postMessageBtn").addEventListener("click", () => {
    const content = document.getElementById("postMessageContent").value;
    if (content) {
        const user = auth.currentUser;
        const xpGain = Math.floor(Math.random() * (35 - 15 + 1)) + 15;
        
        const postRef = database.ref("postsMessageseth").push();
        postRef.set({
            content: content,
            user: user.email,
            uid: user.uid,
            timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
            replies: {}
        });

        const userRef = database.ref("users/" + user.uid);
        userRef.once("value").then(snapshot => {
            let userData = snapshot.val() || { xp: 0, level: 1 };
            let newXp = userData.xp + xpGain;
            let newLevel = userData.level;
            let xpRequired = userData.level <= 5 ? 500 : 1200;
            
            if (newXp >= xpRequired) {
                newXp -= xpRequired;
                newLevel++;
            }

            let badge = "♢";
            if (newLevel >= 5) badge = "♦";
            if (newLevel >= 15) badge = "♦️";
            if (newLevel >= 20) badge = "Ethereum";
            
            userRef.update({ xp: newXp, level: newLevel });
            postRef.update({ badge: badge });
        });

        document.getElementById("postMessageContent").value = "";
    }
});

database.ref("postsMessageseth").on("child_added", snapshot => {
    const data = snapshot.val();
    const postId = snapshot.key;
    const element = document.createElement("div");
    element.classList.add("message");

    let postContent = `
        <p>
            <strong><span class="clickable" onclick="viewProfile('${data.uid}')">${data.user} ${data.badge || ""}</span>:</strong> 
            ${data.content} 
            <span class='timestamp'>(${data.timestamp})</span>
        </p>`;

    element.innerHTML = postContent;

    // Tombol Hapus
    auth.onAuthStateChanged(user => {
    if (user && user.uid === data.uid) {
        if (!element.querySelector(".delete-btn")) { // Cek apakah tombol hapus sudah ada
            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = "Hapus";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => {
                database.ref(`postsMessageseth/${postId}/replies`).once("value").then(replySnapshot => {
                    if (!replySnapshot.exists()) {
                        database.ref(`postsMessageseth/${postId}`).remove().then(() => {
                            element.remove();
                        });
                    } else {
                        alert("Tidak bisa menghapus post karena sudah memiliki balasan.");
                    }
                });
            });
            element.appendChild(deleteBtn);
        }
    }
});

    // Bagian Reply
    const repliesContainer = document.createElement("div");
    repliesContainer.classList.add("replies");
    database.ref(`postsMessageseth/${postId}/replies`).on("child_added", replySnapshot => {
        const replyData = replySnapshot.val();
        const replyId = replySnapshot.key;

        const replyElement = document.createElement("div");
        replyElement.classList.add("reply");
        replyElement.innerHTML = `<p><strong><span class="clickable" onclick="viewProfile('${replyData.uid}')">${replyData.user} ${replyData.badge || "😀"}</span>:</strong> ${replyData.content} <span class='timestamp'>(${replyData.timestamp})</span></p>`;

        // Tombol Hapus untuk Reply
        auth.onAuthStateChanged(user => {
            if (user && user.uid === replyData.uid) {
                const deleteReplyBtn = document.createElement("button");
                deleteReplyBtn.innerText = "Hapus";
                deleteReplyBtn.addEventListener("click", () => {
                    database.ref(`postsMessageseth/${postId}/replies/${replyId}`).remove().then(() => {
                        replyElement.remove();
                    }).catch(error => {
                        alert("Gagal menghapus reply: " + error.message);
                    });
                });
                replyElement.appendChild(deleteReplyBtn);
            }
        });

        repliesContainer.appendChild(replyElement);
    });

    // Input Reply
    const replyInput = document.createElement("input");
    replyInput.type = "text";
    replyInput.placeholder = "Tulis balasan...";
    replyInput.classList.add("reply-input");
    
    const replyButton = document.createElement("button");
    replyButton.innerText = "Reply";
    replyButton.classList.add("reply-button");
    replyButton.addEventListener("click", () => {
        const replyContent = replyInput.value.trim();
        if (replyContent) {
            const replyRef = database.ref(`postsMessageseth/${postId}/replies`).push();
            replyRef.set({
                content: replyContent,
                user: auth.currentUser.email,
                uid: auth.currentUser.uid,
                badge: "♢♢", // Badge default untuk reply
                timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString()
            });
            replyInput.value = "";
        }
    });

    element.appendChild(repliesContainer);
    element.appendChild(replyInput);
    element.appendChild(replyButton);
    document.getElementById("feed").prepend(element);
});

function viewProfile(uid) {
    const userRef = database.ref(`wallets/${uid}`);

    userRef.once("value").then(snapshot => {
        const data = snapshot.val();
        if (!data) {
            alert("Profil tidak ditemukan!");
            return;
        }

        const selectedNetwork = "eth"; // Ganti dengan network yang sedang dipilih
        const balance = data[selectedNetwork]?.balance || 0;

        document.getElementById("profileContent").innerHTML = `
            <p><strong>Email:</strong> ${auth.email || "Tidak diketahui"}</p>
            <p><strong>UID:</strong> ${uid}</p>
            <p><strong>Saldo (${selectedNetwork.toUpperCase()}):</strong> ${balance} ETH</p>
        `;
        document.getElementById("profileModal").style.display = "block";
    });
}

function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
}

function updateLeaderboard() {
    database.ref("users").orderByChild("xp").limitToLast(10).on("value", snapshot => {
        const leaderboardList = document.getElementById("leaderboardList");
        leaderboardList.innerHTML = "";
        let users = [];

        snapshot.forEach(childSnapshot => {
            let userData = childSnapshot.val();
            userData.userId = childSnapshot.key; // Ambil UID dari Firebase
            users.push(userData);
        });

        users.reverse().forEach(user => {
            const li = document.createElement("li");
            li.innerHTML = `${user.userId} - Level: ${user.level}, XP: ${user.xp}`;
            leaderboardList.appendChild(li);
        });
    });
}
updateLeaderboard();

function replyMessage(postId) {
    const replyText = document.getElementById(`replyInput-${postId}`).value;
    const gifUrl = document.getElementById(`replyGif-${postId}`).value; // Input URL GIF
    const user = auth.currentUser;
    const selectedNetwork = "eth"; // Hanya menggunakan saldo ETH

    if (!user || (!replyText && !gifUrl)) {
        alert("Ketik pesan atau masukkan URL GIF!");
        return;
    }

    const balanceRef = database.ref(`wallets/${user.uid}/${selectedNetwork}/balance`);

    balanceRef.once("value").then(snapshot => {
        let balance = snapshot.val() || 0;

        if (gifUrl && balance < gifCost) {
            alert("Saldo ETH tidak cukup untuk mengirim GIF!");
            return;
        }

        if (gifUrl) {
            balance -= gifCost;
            balanceRef.set(balance); // Kurangi saldo ETH jika reply dengan GIF
        }

        const replyRef = database.ref(`postsMessageseth/${postId}/replies`).push();
        replyRef.set({
            replyText: replyText,
            gifUrl: gifUrl || null,
            user: user.email,
            uid: user.uid,
            timestamp: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString()
        });

        document.getElementById(`replyInput-${postId}`).value = "";
        document.getElementById(`replyGif-${postId}`).value = "";
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        document.getElementById("authSection").style.display = "none";
        document.getElementById("profileButton").style.display = "block";
        document.getElementById("profileEmail").innerText = user.email;
    } else {
        document.getElementById("authSection").style.display = "block";
        document.getElementById("profileButton").style.display = "none";
        document.getElementById("profileMenu").style.display = "none";
    }
});

function toggleProfileMenu() {
    let menu = document.getElementById("profileMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openProfile() {
    alert("Fitur profil akan segera hadir!");
}

function logout() {
    firebase.auth().signOut().then(() => {
        location.reload();
    });
}
