import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import toast from "react-hot-toast";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
  FiLayout,
  FiGrid,
  FiMessageSquare,
  FiLink,
  FiType,
} from "react-icons/fi";

const API_URL = "http://localhost:5000/api/product-page/product-page";

const iconOptions = ["FiMail", "FiZap", "FiSend", "FiRepeat", "FiBarChart2"];

const AdminProductPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_URL);

        if (!res.ok) {
          toast.error("Failed to fetch product page content");
          return;
        }

        const data = await res.json();

        setContent({
          logoText: "",
          ...data,
          hero: {
            badge: "",
            title: "",
            description: "",
            buttons: [],
            ...data.hero,
          },
          workflowSection: {
            title: "",
            description: "",
            cards: [],
            ...data.workflowSection,
          },
          scaleSection: {
            title: "",
            description: "",
            cards: [],
            ...data.scaleSection,
          },
          contactSection: {
            title: "",
            description: "",
            bullets: [],
            buttonText: "",
            ...data.contactSection,
          },
          footer: {
            copyrightText: "",
            ...data.footer,
          },
        });
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("usertoken");

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        toast.success("Product page updated successfully");
      } else {
        toast.error("Failed to update product page");
      }
    } catch (err) {
      toast.error("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  const updateRootField = (field, value) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateField = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateArrayItem = (section, field, index, subField, value) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];

      if (subField === null) {
        updated[index] = value;
      } else {
        updated[index] = {
          ...updated[index],
          [subField]: value,
        };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const addArrayItem = (section, field, item) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), item],
      },
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];
      updated.splice(index, 1);

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const moveArrayItem = (section, field, index, direction) => {
    setContent((prev) => {
      const updated = [...(prev[section]?.[field] || [])];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= updated.length) return prev;

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  const TextInput = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
      />
    </div>
  );

  const TextArea = ({ label, value, onChange, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-28 resize-none"
      />
    </div>
  );

  const IconSelect = ({ label, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <select
        value={value || "FiZap"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
      >
        {iconOptions.map((icon) => (
          <option key={icon} value={icon}>
            {icon}
          </option>
        ))}
      </select>
    </div>
  );

  const AddButton = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-100 hover:bg-indigo-100"
    >
      <FiPlus /> {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-medium text-gray-500 tracking-wide">
            Loading Product Content...
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: <FiType /> },
    { id: "hero", label: "Hero Section", icon: <FiLayout /> },
    { id: "workflow", label: "Workflow Section", icon: <FiGrid /> },
    { id: "scale", label: "Scale Section", icon: <FiGrid /> },
    { id: "contact", label: "Contact Section", icon: <FiMessageSquare /> },
    { id: "footer", label: "Footer", icon: <FiLink /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50  flex">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto w-full">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Product Page Content
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage product page content dynamically.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          >
            <FiSave className={saving ? "animate-pulse" : ""} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {content && (
          <div className="p-8 flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-64 flex-shrink-0 sticky top-32 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span
                    className={
                      activeTab === tab.id
                        ? "text-indigo-600"
                        : "text-slate-400"
                    }
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
              {activeTab === "general" && (
                <div className="max-w-3xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                    General
                  </h2>

                  <TextInput
                    label="Logo Text"
                    value={content.logoText}
                    onChange={(value) => updateRootField("logoText", value)}
                  />
                </div>
              )}

              {activeTab === "hero" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiLayout className="text-indigo-500" /> Hero Section
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Badge"
                      value={content.hero.badge}
                      onChange={(value) => updateField("hero", "badge", value)}
                    />

                    <TextInput
                      label="Title"
                      value={content.hero.title}
                      onChange={(value) => updateField("hero", "title", value)}
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Description"
                        value={content.hero.description}
                        onChange={(value) =>
                          updateField("hero", "description", value)
                        }
                      />
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Hero Buttons
                        </h3>

                        <AddButton
                          label="Add Button"
                          onClick={() =>
                            addArrayItem("hero", "buttons", {
                              text: "New Button",
                              route: "/",
                              isPrimary: false,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.hero.buttons?.map((button, index) => (
                          <div
                            key={button._id || index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-slate-700">
                                Button {index + 1}
                              </h4>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    moveArrayItem("hero", "buttons", index, -1)
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowUp />
                                </button>

                                <button
                                  onClick={() =>
                                    moveArrayItem("hero", "buttons", index, 1)
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowDown />
                                </button>

                                <button
                                  onClick={() =>
                                    removeArrayItem("hero", "buttons", index)
                                  }
                                  className="text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>

                            <TextInput
                              label="Button Text"
                              value={button.text}
                              onChange={(value) =>
                                updateArrayItem(
                                  "hero",
                                  "buttons",
                                  index,
                                  "text",
                                  value
                                )
                              }
                            />

                            <TextInput
                              label="Button Route"
                              value={button.route}
                              onChange={(value) =>
                                updateArrayItem(
                                  "hero",
                                  "buttons",
                                  index,
                                  "route",
                                  value
                                )
                              }
                            />

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={!!button.isPrimary}
                                onChange={(e) =>
                                  updateArrayItem(
                                    "hero",
                                    "buttons",
                                    index,
                                    "isPrimary",
                                    e.target.checked
                                  )
                                }
                              />
                              Primary Button
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "workflow" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiGrid className="text-indigo-500" /> Workflow Section
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Section Title"
                      value={content.workflowSection.title}
                      onChange={(value) =>
                        updateField("workflowSection", "title", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Section Description"
                        value={content.workflowSection.description}
                        onChange={(value) =>
                          updateField("workflowSection", "description", value)
                        }
                      />
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Workflow Cards
                        </h3>

                        <AddButton
                          label="Add Card"
                          onClick={() =>
                            addArrayItem("workflowSection", "cards", {
                              iconName: "FiZap",
                              label: "New Label",
                              title: "New Card",
                              description: "Card description",
                              visualText: "visual text",
                              className: "",
                            })
                          }
                        />
                      </div>

                      <div className="space-y-5">
                        {content.workflowSection.cards?.map((card, index) => (
                          <div
                            key={card._id || index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-slate-700">
                                Card {index + 1}
                              </h4>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    moveArrayItem(
                                      "workflowSection",
                                      "cards",
                                      index,
                                      -1
                                    )
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowUp />
                                </button>

                                <button
                                  onClick={() =>
                                    moveArrayItem(
                                      "workflowSection",
                                      "cards",
                                      index,
                                      1
                                    )
                                  }
                                  className="text-slate-500"
                                >
                                  <FiArrowDown />
                                </button>

                                <button
                                  onClick={() =>
                                    removeArrayItem(
                                      "workflowSection",
                                      "cards",
                                      index
                                    )
                                  }
                                  className="text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <IconSelect
                                label="Icon Name"
                                value={card.iconName}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "workflowSection",
                                    "cards",
                                    index,
                                    "iconName",
                                    value
                                  )
                                }
                              />

                              <TextInput
                                label="Label"
                                value={card.label}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "workflowSection",
                                    "cards",
                                    index,
                                    "label",
                                    value
                                  )
                                }
                              />

                              <TextInput
                                label="Title"
                                value={card.title}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "workflowSection",
                                    "cards",
                                    index,
                                    "title",
                                    value
                                  )
                                }
                              />

                              <TextInput
                                label="Visual Text"
                                value={card.visualText}
                                onChange={(value) =>
                                  updateArrayItem(
                                    "workflowSection",
                                    "cards",
                                    index,
                                    "visualText",
                                    value
                                  )
                                }
                              />

                              <TextInput
                                label="Class Name"
                                value={card.className}
                                placeholder="lg:col-span-2 / lg:row-span-2"
                                onChange={(value) =>
                                  updateArrayItem(
                                    "workflowSection",
                                    "cards",
                                    index,
                                    "className",
                                    value
                                  )
                                }
                              />

                              <div className="md:col-span-2">
                                <TextArea
                                  label="Description"
                                  value={card.description}
                                  onChange={(value) =>
                                    updateArrayItem(
                                      "workflowSection",
                                      "cards",
                                      index,
                                      "description",
                                      value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "scale" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiGrid className="text-indigo-500" /> Scale Section
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Section Title"
                      value={content.scaleSection.title}
                      onChange={(value) =>
                        updateField("scaleSection", "title", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Section Description"
                        value={content.scaleSection.description}
                        onChange={(value) =>
                          updateField("scaleSection", "description", value)
                        }
                      />
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Scale Cards
                        </h3>

                        <AddButton
                          label="Add Card"
                          onClick={() =>
                            addArrayItem("scaleSection", "cards", {
                              iconName: "FiMail",
                              title: "New Card",
                              description: "Card description",
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {content.scaleSection.cards?.map((card, index) => (
                          <div
                            key={card._id || index}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold text-slate-700">
                                Card {index + 1}
                              </h4>

                              <button
                                onClick={() =>
                                  removeArrayItem(
                                    "scaleSection",
                                    "cards",
                                    index
                                  )
                                }
                                className="text-red-500"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <IconSelect
                              label="Icon Name"
                              value={card.iconName}
                              onChange={(value) =>
                                updateArrayItem(
                                  "scaleSection",
                                  "cards",
                                  index,
                                  "iconName",
                                  value
                                )
                              }
                            />

                            <TextInput
                              label="Title"
                              value={card.title}
                              onChange={(value) =>
                                updateArrayItem(
                                  "scaleSection",
                                  "cards",
                                  index,
                                  "title",
                                  value
                                )
                              }
                            />

                            <TextArea
                              label="Description"
                              value={card.description}
                              onChange={(value) =>
                                updateArrayItem(
                                  "scaleSection",
                                  "cards",
                                  index,
                                  "description",
                                  value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiMessageSquare className="text-indigo-500" /> Contact
                    Section
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <TextInput
                      label="Title"
                      value={content.contactSection.title}
                      onChange={(value) =>
                        updateField("contactSection", "title", value)
                      }
                    />

                    <TextInput
                      label="Button Text"
                      value={content.contactSection.buttonText}
                      onChange={(value) =>
                        updateField("contactSection", "buttonText", value)
                      }
                    />

                    <div className="col-span-full">
                      <TextArea
                        label="Description"
                        value={content.contactSection.description}
                        onChange={(value) =>
                          updateField("contactSection", "description", value)
                        }
                      />
                    </div>

                    <div className="col-span-full border-t border-slate-100 pt-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Bullets
                        </h3>

                        <AddButton
                          label="Add Bullet"
                          onClick={() =>
                            addArrayItem(
                              "contactSection",
                              "bullets",
                              "New bullet point"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        {content.contactSection.bullets?.map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={item || ""}
                              onChange={(e) =>
                                updateArrayItem(
                                  "contactSection",
                                  "bullets",
                                  index,
                                  null,
                                  e.target.value
                                )
                              }
                              className="flex-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />

                            <button
                              onClick={() =>
                                removeArrayItem(
                                  "contactSection",
                                  "bullets",
                                  index
                                )
                              }
                              className="px-3 text-red-500"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "footer" && (
                <div className="max-w-3xl">
                  <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiLink className="text-indigo-500" /> Footer
                  </h2>

                  <TextInput
                    label="Copyright Text"
                    value={content.footer.copyrightText}
                    onChange={(value) =>
                      updateField("footer", "copyrightText", value)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductPage;