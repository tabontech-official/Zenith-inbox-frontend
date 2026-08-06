import { useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/admin/scripts";

const injectScripts = (scriptText, target) => {
  if (!scriptText) return;

  // Initialize Tawk_API safely if present in custom script text
  if (scriptText.includes("tawk.to") || scriptText.includes("Tawk_API")) {
    window.Tawk_API = window.Tawk_API || {};
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = scriptText;

  wrapper.querySelectorAll("script").forEach((oldScript) => {
    const src = oldScript.getAttribute("src");
    // Avoid re-injecting duplicate scripts with identical src
    if (src && document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const newScript = document.createElement("script");

    [...oldScript.attributes].forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    if (oldScript.innerHTML) {
      newScript.innerHTML = oldScript.innerHTML;
    }

    document[target].appendChild(newScript);
  });
};

const DynamicScripts = () => {
  useEffect(() => {
    // Intercept third-party widget errors (e.g. Tawk.to BufferLoader sound file XHR errors)
    const handleGlobalError = (event) => {
      const msg = event?.message || "";
      const filename = event?.filename || "";
      const stack = event?.error?.stack || "";

      if (
        msg.includes("BufferLoader") ||
        msg.includes("XHR error for undefined") ||
        filename.includes("tawk.to") ||
        stack.includes("tawk.to")
      ) {
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
        return true;
      }
    };

    const handleUnhandledRejection = (event) => {
      const reason = event?.reason?.toString() || "";
      if (reason.includes("BufferLoader") || reason.includes("tawk.to")) {
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      }
    };

    window.addEventListener("error", handleGlobalError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    const loadScripts = async () => {
      try {
        const res = await axios.get(API_URL);
        const data = res.data?.data;

        if (!data?.isActive) return;

        injectScripts(data.headerScript, "head");
        injectScripts(data.footerScript, "body");
      } catch (error) {
        console.error("Failed to load dynamic scripts", error);
      }
    };

    loadScripts();

    return () => {
      window.removeEventListener("error", handleGlobalError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
};

export default DynamicScripts;
