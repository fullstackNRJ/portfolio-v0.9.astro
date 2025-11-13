console.log("Within ... v1");

function getUtmStrFromLocalStorage() {
  try {
    const raw = localStorage.getItem("rf_attribution");
    if (!raw) return "";
    const trimmed = raw.trim();
    // If already a query string
    if (
      trimmed.startsWith("?") ||
      trimmed.startsWith("&") ||
      trimmed.includes("=")
    ) {
      const qs = trimmed.replace(/^&/, "");
      return qs.startsWith("?") ? qs : `?${qs}`;
    }
    // Try parsing JSON object
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const obj = JSON.parse(trimmed);
      const params = new URLSearchParams();
      Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        params.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      });
      const qs = params.toString();
      return qs ? `?${qs}` : "";
    }
    return "";
  } catch (err) {
    console.warn("Failed to parse rf_attribution from localStorage", err);
    return "";
  }
}

const checkIfEmailIdIsAllowed = (email) => {
  let domain = email.trim().split("@")[1].toLowerCase();
  if (
    [
      "icloud.com",
      "live.fr",
      "mail.ru",
      "hotmail.fr",
      "hotmail.co.uk",
      "gmail.com",
      "outlook.de",
      "outlook.com",
      "mail.com",
      "apptunix.com",
      "hotmail.com",
      "googlemail.com",
      "live.com",
      "ratri.in",
      "outlook.fr",
      "iukstudios.com",
      "ymail.com",
      "microsoft.com",
      "apptunixmediatech.com",
      "comcast.net",
      "depaul.edu.in",
      "outlook.in",
      "recruitcrm.io",
      "mikesecurity.net",
      "yahoo.de",
      "hiexpresscorona.com",
      "krsrk.co.in",
      "aritzia-hire.com",
      "yahoo.fr",
      "yahoo.co.uk",
    ].indexOf(domain) > -1
  ) {
    return {
      result: false,
      message: "Please sign up using your work email ID.",
    };
  }
  let blocked_tlds = [".online"];
  for (let i = 0; i < blocked_tlds.length; i++) {
    if (domain.endsWith(blocked_tlds[i])) {
      return { result: false, message: "Email ID not allowed" };
    }
  }
  return { result: true };
};

const recordInvalidEmailAttempt = async ({
  email,
  firstName = "",
  lastName = "",
}) => {
  try {
    await fetch("https://recruiterflow.com/api/external/record-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enteredEmail: email,
        authorizedEmail: "",
        message: "Email ID not allowed",
        isSuccess: 0,
        Name: `${firstName} ${lastName}`.trim(),
        platform: "",
        emailType: 2,
      }),
    });
  } catch (err) {
    console.warn("Failed to record invalid email", err);
  }
};

function getHubSpotUTK() {
  const match = document.cookie.match(/hubspotutk=([^;]+)/);
  return match ? match[1] : null;
}

//on submit-btn click validate email input using checkIfEmailIdIsAllowed function
//if invalid show error message in email-error element
//if valid clear error message in email-error element
document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.querySelector("[submit-btn]");
  const emailInput = document.querySelector("[email-input]");
  const emailError = document.querySelector("[email-error]");
  const firstNameInput = document.querySelector("[first-name-input]");
  const lastNameInput = document.querySelector("[last-name-input]");
  const utmStr = getUtmStrFromLocalStorage();

  if (submitButton && emailInput && emailError) {
    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const validation = checkIfEmailIdIsAllowed(email);
      const firstName = firstNameInput ? firstNameInput.value : "";
      const lastName = lastNameInput ? lastNameInput.value : "";

      if (!validation.result) {
        e.preventDefault();
        emailError.textContent = validation.message;
        emailError.style.display = "block";
        recordInvalidEmailAttempt({ email, firstName, lastName });
      } else {
        emailError.textContent = "";
        emailError.style.display = "none";
        // Handle successful validation, e.g., submit the form
        // e.g. document.getElementById('your-form-id').submit();
        const payload = {
          fields: [
            { name: "firstname", value: firstName },
            { name: "lastname", value: lastName },
            { name: "email", value: email },
            {
              name: "recent_conversion",
              value: window.location.pathname,
            },
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.location.pathname,
            hutk: getHubSpotUTK(),
          },
        };

        try {
          const res = await fetch(
            "https://api.hsforms.com/submissions/v3/integration/submit/44665291/52919bee-e3e0-4b6c-b8d3-3a4d3ba4adbe",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          if (res.ok) {
            console.log("✅ Sent to HubSpot");

            // Prevent form submission/navigation when opening popup
            // e.preventDefault();
            const utms = `https://${window.location.hostname}${utmStr}`;
            const urlParams = new URL(utms);
            const utm_source = urlParams.searchParams.get("utm_source");
            const utm_medium = urlParams.searchParams.get("utm_medium");
            const utm_campaign = urlParams.searchParams.get("utm_campaign");
            console.log("utms", utm_campaign, utm_source, utm_medium);
            signals?.form({
              firstname: firstName,
              lastname: lastName,
              email: email,
              // how_many_users: safeCount,
              utm_source: utm_source,
              utm_medium: utm_medium,
              utm_campaign: utm_campaign,
            });
          } else {
            console.error("❌ HubSpot error", await res.json());
            // form.querySelector(".w-form-fail").style.display = "block";
          }
        } catch (err) {
          console.error("❌ Request failed", err);
          // form.querySelector(".w-form-fail").style.display = "block";
        }
      }
    });
  }
});
