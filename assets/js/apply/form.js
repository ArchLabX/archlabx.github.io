const FORM_ENDPOINT = "https://cloudflare.archfx.workers.dev/";

let turnstileToken = "";
let turnstileWidgetId = null;

const form = document.getElementById("application-form");
const status = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");
const ack = document.getElementById("acknowledgment");

// ---------- Helpers ----------
function setStatus(text, iconClass = "", iconColor = "") {
  if (!status) return;

  status.textContent = "";

  if (iconClass) {
    const icon = document.createElement("i");
    icon.className = iconClass;

    if (iconColor) {
      icon.style.color = iconColor;
    }

    status.appendChild(icon);
    status.append(" ");
  }

  status.append(text);
}

function updateSubmitState() {
  if (!submitBtn) return;
  submitBtn.disabled = !(ack?.checked && turnstileToken);
}

function resetTurnstile() {
  turnstileToken = "";

  if (window.turnstile && turnstileWidgetId !== null) {
    window.turnstile.reset(turnstileWidgetId);
  }

  updateSubmitState();
}

// ---------- Turnstile ----------
window.addEventListener("load", function () {
  if (!window.turnstile) {
    setStatus("Turnstile could not be loaded. Please refresh the page.");
    return;
  }

  turnstileWidgetId = window.turnstile.render("#turnstile-container", {
    sitekey: "0x4AAAAAADCj3wumD6CYdCpq",

    callback: function (token) {
      turnstileToken = token;
      updateSubmitState();
    },

    "expired-callback": function () {
      turnstileToken = "";
      updateSubmitState();
      setStatus("Turnstile verification expired. Please verify again.");
    },

    "error-callback": function () {
      turnstileToken = "";
      updateSubmitState();
      setStatus(
        "Turnstile verification failed. Please try again.",
        "fas fa-times-circle",
        "#F22222"
      );
    }
  });
});

// ---------- Initial state ----------
if (submitBtn) {
  submitBtn.disabled = true;
}

if (ack) {
  ack.addEventListener("change", updateSubmitState);
}

// ---------- File name display ----------
const cvInput = document.getElementById("cv");
const transcriptInput = document.getElementById("transcript");

if (cvInput) {
  cvInput.addEventListener("change", function () {
    const fileName = this.files[0]?.name || "No file selected";
    const label = document.getElementById("cv-file-name");
    if (label) label.textContent = fileName;
  });
}

if (transcriptInput) {
  transcriptInput.addEventListener("change", function () {
    const fileName = this.files[0]?.name || "No file selected";
    const label = document.getElementById("transcript-file-name");
    if (label) label.textContent = fileName;
  });
}

// ---------- Form submission ----------
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    setStatus("");

    const file = form.cv?.files?.[0];
    const interests = form.interests?.value?.trim() || "";

    if (!ack?.checked) {
      setStatus("Please confirm the acknowledgment before submitting.");
      return;
    }

    if (!turnstileToken) {
      setStatus("Please complete the Turnstile verification.");
      updateSubmitState();
      return;
    }

    if (!file) {
      setStatus("Please upload your CV.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setStatus("CV must be a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("CV must be smaller than 5 MB.");
      return;
    }

    const wordCount = interests.split(/\s+/).filter(Boolean).length;

    if (wordCount < 50 || wordCount > 250) {
      setStatus("Research statement must be between 50 and 250 words.");
      return;
    }

    const formData = new FormData(form);

    try {
      setStatus("Submitting...", "fas fa-spinner fa-spin");

      if (submitBtn) submitBtn.disabled = true;

      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        setStatus(
          data.error || "Submission failed.",
          "fas fa-times-circle",
          "#F22222"
        );

        resetTurnstile();
        return;
      }

      form.reset();
      resetTurnstile();

      setStatus(
        "Application submitted successfully.",
        "fas fa-check-circle",
        "#22F24C"
      );
    } catch (err) {
      setStatus(
        "Network error. Please try again.",
        "fas fa-times-circle",
        "#F22222"
      );

      resetTurnstile();
    }
  });
}