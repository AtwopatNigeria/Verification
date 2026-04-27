async function verifyMember(idOverride) {
  // 1. Get ID from input or parameter
  let id = idOverride || document.getElementById("memberId").value;

  if (!id) {
    alert("Please enter a Member ID");
    return;
  }

  const resultDiv = document.getElementById("result");
  // Enhanced loading state
  resultDiv.innerHTML = "<p style='color:#666; font-weight:bold;'>🔄 Verifying Member...</p>";

  try {
    // 2. Fetch from Google Apps Script API
    let response = await fetch(API_URL + "?action=verify&id=" + encodeURIComponent(id));
    let data = await response.json();

    console.log("API RESPONSE:", data); // Helpful for debugging

    // 3. Handle 'Not Found' or Error
    if (!data || data.status === "NOT_FOUND" || data.status === "ERROR") {
      resultDiv.innerHTML = `
        <div style="background: rgba(255,0,0,0.1); padding: 15px; border-radius: 8px; border: 1px solid red;">
          <p style='color:red; margin:0;'>❌ Member Not Found or ID Invalid</p>
        </div>`;
      return;
    }

    /* =============================================
       🔥 IMAGE LINK TRANSFORMER
       Converts Drive URL to a direct viewable image
    ============================================= */
    let rawPhoto = data.passport || '';
    let directPhoto = "";

    if (rawPhoto.includes("drive.google.com")) {
        let fileId = rawPhoto.match(/\/d\/(.+?)\//);
        // Using the high-res direct link format
        directPhoto = fileId ? `https://lh3.googleusercontent.com/d/${fileId[1]}` : rawPhoto;
    } else {
        directPhoto = rawPhoto || 'default-avatar.png';
    }

    // 4. Map the data
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
    
    /* =============================================
       BADGE & STATUS LOGIC
    ============================================= */
    let nameBadge = ""; 
    let telegramButton = "";
    let statusDisplay = "";

    if (member.expired) {
      statusDisplay = `<span style="color:#d93025; font-weight:bold;">Expired</span>`;
      telegramButton = `<p style="color:#d93025; font-weight:bold;">Please contact Admin for renewal.</p>`;
    } 
    else if (currentStatus === "active") {
      // Increased badge size slightly (22px) and kept inline
      nameBadge = `<img src="verify.png" style="width:22px; height:22px; vertical-align: middle; margin-left: 8px; display: inline-block;">`;
      
      statusDisplay = `<span style="color:#1e8e3e; font-weight:bold;">Active</span>`;
      
      telegramButton = `
        <a href="https://t.me/+0qCgEbssFKw3ZmM0" target="_blank" style="text-decoration:none;">
          <button style="background-color: #0088cc; color: white; padding: 14px; border: none; border-radius: 10px; cursor: pointer; width: 100%; font-size: 16px; font-weight:bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Join Official Telegram
          </button>
        </a>`;
    } else {
      statusDisplay = `<span style="font-weight:bold;">${member.statusValue || "Unknown"}</span>`;
      telegramButton = `<a href="mailto:support.atwopat@gmail.com"><button>Contact Support</button></a>`;
    }

    /* =============================================
       FINAL UI OUTPUT (Upgraded Design)
    ============================================= */
    resultDiv.innerHTML = `
      <div class="card" style="
        border: 1px solid rgba(255,255,255,0.3); 
        padding: 25px; 
        border-radius: 15px; 
        text-align: center; 
        max-width: 360px; 
        margin: 20px auto; 
        background: rgba(255, 255, 255, 0.85); /* 85% Transparent background */
        backdrop-filter: blur(10px); /* Creates a modern frosted glass look */
        box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        
        <h2 style="margin-top:0; color:#222; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">ATWOPAT MEMBER</h2>
        
        <div style="margin-bottom: 20px;">
          <img src="${member.photo}" width="140" height="140" style="border-radius: 12px; border: 4px solid #fff; object-fit: cover; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        </div>

        <div style="text-align: left; line-height: 2; color: #333; font-size: 16px;">
          
          <div style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <b>Name:</b>&nbsp;<span>${member.name}</span>${nameBadge}
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
            <b>State:</b> ${member.state}
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
            <b>Role:</b> ${member.role}
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
            <b>Member ID:</b> ${member.id}
          </div>
          
          <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
            <b>Status:</b> ${statusDisplay}
          </div>
          
          <div style="padding: 5px 0;">
            <b>Expiry:</b> ${member.expiry || 'N/A'}
          </div>

        </div>

        <div style="margin: 20px 0;">
          <img src="${member.qr || ''}" width="110" style="background: white; border: 1px solid #ddd; padding: 8px; border-radius: 8px;">
        </div>

        <div style="margin-top: 10px;">
          ${telegramButton}
        </div>

      </div>
    `;

  } catch (error) {
    console.error("Fetch Error:", error);
    resultDiv.innerHTML = "<p style='color:red;'>❌ Connection error. Check your internet.</p>";
  }
}
