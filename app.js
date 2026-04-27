async function verifyMember(idOverride) {
  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Please enter a Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>Searching database...</p>";

  try {
    let response = await fetch(API_URL + "?action=verify&id=" + encodeURIComponent(id));
    let data = await response.json();

    if (!data || data.status === "NOT_FOUND" || data.status === "ERROR") {
      resultDiv.innerHTML = "<p style='color:red;'>❌ Member not found</p>";
      return;
    }

    /* =============================================
       🔥 IMAGE LINK TRANSFORMER (CRITICAL)
       This converts your /view link into a direct img
    ============================================= */
    let rawPhoto = data.passport || '';
    let directPhoto = "";

    if (rawPhoto.includes("drive.google.com")) {
        // This regex finds the ID between /d/ and /view
        let fileId = rawPhoto.match(/\/d\/(.+?)\//);
        if (fileId && fileId[1]) {
            directPhoto = `https://lh3.googleusercontent.com/d/${fileId[1]}`;
        } else {
            directPhoto = rawPhoto; // Fallback
        }
    } else {
        directPhoto = rawPhoto || 'default-avatar.png';
    }

    const member = {
      id: data.memberId,
      name: data.fullName,
      state: data.state,
      role: data.role,
      statusValue: data.memberStatus,
      photo: directPhoto, 
      qr: data.qr,
      expiry: data.expiry,
      expired: data.expired
    };

    let currentStatus = (member.statusValue || "").toString().trim().toLowerCase();
    
    let nameBadge = ""; 
    let telegramButton = "";
    let statusText = "";

    if (member.expired) {
      statusText = `<span style="color:red;">Expired</span>`;
      telegramButton = `<p style="color:red;">Membership Expired.</p>`;
    } 
    else if (currentStatus === "active") {
      nameBadge = `<img src="verify.png" style="width:18px; height:18px; vertical-align: middle; margin-left: 5px;">`;
      statusText = `<span style="color:green; font-weight:bold;">Active</span>`;
      telegramButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0" target="_blank">
          <button style="background-color: #0088cc; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
            Join Official Telegram
          </button>
        </a>`;
    } else {
      statusText = member.statusValue || "Unknown";
      telegramButton = `<a href="mailto:support.atwopat@gmail.com"><button>Contact Support</button></a>`;
    }

    /* =========================
       FINAL OUTPUT
    ========================= */
    resultDiv.innerHTML = `
      <div class="card" style="border: 1px solid #ccc; padding: 20px; border-radius: 10px; text-align: center; max-width: 350px; margin: auto; background: white;">
        <h3 style="margin-top:0;">ATWOPAT MEMBER</h3>
        
        <img src="${member.photo}" width="120" height="120" style="border-radius: 8px; border: 2px solid #eee; object-fit: cover;"><br><br>

        <div style="text-align: left; line-height: 1.8;">
          <b>Name:</b> ${member.name}${nameBadge} <br>
          <b>State:</b> ${member.state} <br>
          <b>Role:</b> ${member.role} <br>
          <b>Member ID:</b> ${member.id} <br>
          <b>Status:</b> ${statusText} <br>
          <b>Expiry:</b> ${member.expiry || 'N/A'}
        </div>

        <br>
        <img src="${member.qr || ''}" width="100" style="border: 1px solid #eee; padding: 5px;"><br><br>

        ${telegramButton}
      </div>
    `;

  } catch (error) {
    console.error("Fetch Error:", error);
    resultDiv.innerHTML = "<p style='color:red;'>❌ Connection Error.</p>";
  }
}
