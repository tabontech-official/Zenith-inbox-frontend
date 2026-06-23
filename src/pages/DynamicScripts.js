import { useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/admin/scripts";

const injectScripts = (scriptText, target) => {
  if (!scriptText) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = scriptText;

  wrapper.querySelectorAll("script").forEach((oldScript) => {
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
  }, []);

  return null;
};

export default DynamicScripts;