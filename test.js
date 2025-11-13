console.log("recruiterflow ....");

//validate business email
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

// Build UTM query string from localStorage key `rf_attribution`
const getUtmStrFromLocalStorage = () => {
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
};

// Record invalid email attempt to Recruiterflow API
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

const getCalendlyUrlForUsers = (count) => {
    if (count <= 3) return "https://calendly.com/recruiterflow-demo/45minutes";
    if (count <= 7)
        return "https://calendly.com/recruiterflow-demo/recruiterflow-demo-clone";
    if (count <= 15)
        return "https://calendly.com/recruiterflow-demo/recruiterflow-demo-clone-1";
    return "https://calendly.com/recruiterflow-demo/recruiterflow-demo-clone-2";
};

function getHubSpotUTK() {
    const match = document.cookie.match(/hubspotutk=([^;]+)/);
    return match ? match[1] : null;
}

const getInputVal = (selector) =>
    document.querySelector(selector)?.value?.trim() || "";

const formElement = document.querySelector("form");
if (formElement) {
    formElement.setAttribute("novalidate", "true");
}
const thanksYouMessage = document?.querySelector("[success-msg]");
const errorMessage = document?.querySelector("[error-msg]");
const firstnameError = document?.querySelector("[firstname-error]");
const lastnameError = document?.querySelector("[lastname-error]");
const userCountError = document?.querySelector("[usercount-error]");
const emailInput = document.querySelector("[email-input]");
const emailError = document?.querySelector("[email-error]");
/* emailInput?.addEventListener("input", (e) => {
  const email = e.target.value;
  const { result, message } = checkIfEmailIdIsAllowed(email);
  if (!result) {
    emailError.innerText = message;
    emailError.style.display = "block";
  } else {
    emailError.innerText = "";
    emailError.style.display = "none";
  }
}); */

const submitBtn = document.querySelector("[submit-btn]");
submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput.value?.trim();
    const { result, message } = checkIfEmailIdIsAllowed(email);
    console.log("EMail >>>", email, result, message, emailError);
    if (!result) {
        e.preventDefault();
        emailError.innerText = message;
        emailError.style.display = "block";

        // Record the invalid email attempt
        const firstNameVal = getInputVal("[first-name-input]");
        const lastNameVal = getInputVal("[last-name-input]");
        recordInvalidEmailAttempt({
            email,
            firstName: firstNameVal,
            lastName: lastNameVal,
        });

        // Stop further processing (e.g., Calendly)
        return;
    } else {
        emailError.innerText = "";
        emailError.style.display = "none";
    }

    //check user count
    const userCountInput = document.querySelector("[users-count-input]");
    let userCount = null;
    if (userCountInput) userCount = parseInt(userCountInput.value);

    // --- Calendly integration, UTM + dynamic URL + prefill + tracking ---
    const count = Number.isFinite(userCount)
        ? userCount
        : parseInt(userCount, 10);
    const safeCount = Number.isFinite(count) && count > 0 ? count : 1;
    const calendlyUrl = getCalendlyUrlForUsers(safeCount);
    const utmStr = getUtmStrFromLocalStorage();

    const firstName = getInputVal("[first-name-input]");
    const lastName = getInputVal("[last-name-input]");
    const fullName =
        firstName || lastName
            ? `${firstName} ${lastName}`.trim()
            : getInputVal("[name-input]") ||
            (email?.split("@")[0] || "").replace(/[._-]/g, " ");

    const description = getInputVal("[description-input]");
    const utms = `https://${window.location.hostname}${utmStr}`;
    const urlParams = new URL(utms);
    const utm_source = urlParams.searchParams.get("utm_source") || "";
    const utm_medium = urlParams.searchParams.get("utm_medium") || "";
    const utm_campaign = urlParams.searchParams.get("utm_campaign") || "";
    console.log("utms", utm_campaign, utm_source, utm_medium);
    const IS_AI_PAGE = window.location.pathname.includes("ai");
    //const formData = new FormData(form);
    const payload = {
        fields: [
            { name: "firstname", value: firstName },
            { name: "lastname", value: lastName },
            { name: "email", value: email },
            ...(IS_AI_PAGE
                ? [
                    {
                        name: "please_describe_the_problem_you_want_the_agent_to_solve",
                        value: description?.trim(),
                    },
                    {
                        name: "recent_conversion",
                        value: window.location.pathname ?? "/ai",
                    },
                ]
                : [
                    {
                        name: "how_many_users_would_actively_be_using_recruiterflow_",
                        value: safeCount,
                    },
                ]),

            {
                name: "utm_source",
                value: utm_source,
            },
            {
                name: "utm_medium",
                value: utm_medium,
            },
            {
                name: "utm_campaign",
                value: utm_campaign,
            },
        ],
        context: {
            pageUri: window.location.href,
            pageName: document.location.pathname,
            hutk: getHubSpotUTK(),
        },
    };

    const formId = window.location.pathname.includes("ai")
        ? "5268f238-7065-45d4-b540-e64aa4cef1f0"
        : "c2769d97-bf41-4efb-a2cf-de57cc25ec0a";
    console.log("Form ID", formId);
    try {
        const res = await fetch(
            `https://api.hsforms.com/submissions/v3/integration/submit/44665291/${formId}`,
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
            // form.reset();
            // Optionally trigger Webflow success message
            //  form.querySelector(".w-form-done").style.display = "block";
            // form.querySelector(".w-form-fail").style.display = "none";
            if (window?.Calendly?.initPopupWidget) {
                window.Calendly.initPopupWidget({
                    url: `${calendlyUrl}${utmStr}`,
                    prefill: {
                        name: fullName,
                        email: email,
                        customAnswers: { a2: safeCount },
                    },
                });
                // Prevent form submission/navigation when opening popup
                // e.preventDefault();
                /* const utms = `https://${window.location.hostname}${utmStr}`;
                const urlParams = new URL(utms);
                const utm_source = urlParams.searchParams.get("utm_source");
                const utm_medium = urlParams.searchParams.get("utm_medium");
                const utm_campaign = urlParams.searchParams.get("utm_campaign");
                console.log("utms", utm_campaign, utm_source, utm_medium); */
                signals?.form({
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    how_many_users: safeCount,
                    utm_source: utm_source,
                    utm_medium: utm_medium,
                    utm_campaign: utm_campaign,
                });
            } else {
                console.warn("Calendly script not loaded");
            }
        } else {
            console.error("❌ HubSpot error", await res.json());
            // form.querySelector(".w-form-fail").style.display = "block";
        }
    } catch (err) {
        console.error("❌ Request failed", err);
        // form.querySelector(".w-form-fail").style.display = "block";
    }

    // Additional tracking
    try {
        if (window?.fpr) {
            window.fpr("referral", { email });
        }
    } catch (err) {
        console.warn("fpr tracking failed", err);
    }

    // Open Calendly popup
    /*  try {
      if (window?.Calendly?.initPopupWidget) {
        window.Calendly.initPopupWidget({
          url: `${calendlyUrl}${utmStr}`,
          prefill: {
            name: fullName,
            email: email,
            customAnswers: { a2: safeCount },
          },
        });
        // Prevent form submission/navigation when opening popup
        e.preventDefault();
      } else {
        console.warn("Calendly script not loaded");
      }
    } catch (err) {
      console.error("Failed to open Calendly popup", err);
    } */
});
