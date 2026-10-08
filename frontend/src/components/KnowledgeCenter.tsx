import { useEffect, useState } from "react";

type KnowledgeItem = {
  id: number;
  teacher_id: number;
  subject: string;
  category: string;
  title: string;
  content: string;
  image_url: string | null;
  image_original_name: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  userRole: string;
  onBack?: () => void;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const emptyForm = {
  subject: "Geography",
  category: "",
  title: "",
  content: "",
};

export default function KnowledgeCenter({
  userRole,
  onBack,
}: Props) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadItems() {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/knowledge-center/`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not load Knowledge Center."
        );
      }

      setItems(data.items || []);
    } catch (error) {
      console.error("Knowledge Center loading error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load Knowledge Center."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setImage(null);
    setEditingId(null);

    const input = document.getElementById(
      "knowledge-image"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  function startEdit(item: KnowledgeItem) {
    setEditingId(item.id);

    setForm({
      subject: item.subject,
      category: item.category,
      title: item.title,
      content: item.content,
    });

    setImage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveItem(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (userRole !== "teacher") {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const formData = new FormData();

      formData.append("subject", form.subject);
      formData.append("category", form.category);
      formData.append("title", form.title);
      formData.append("content", form.content);

      if (image) {
        formData.append("image", image);
      }

      const url = editingId
        ? `${API_URL}/knowledge-center/${editingId}`
        : `${API_URL}/knowledge-center/`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Could not ${
              editingId ? "update" : "add"
            } information.`
        );
      }

      setMessage(
        editingId
          ? "Information updated successfully! ✅"
          : "Information added successfully! 🎉"
      );

      resetForm();

      await loadItems();
    } catch (error) {
      console.error("Knowledge Center save error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save information."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: number) {
    if (userRole !== "teacher") {
      return;
    }

    const confirmed = window.confirm(
      "এই information টি delete করতে চান?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/knowledge-center/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not delete information."
        );
      }

      setMessage("Information deleted successfully. 🗑️");

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (error) {
      console.error("Knowledge Center delete error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete information."
      );
    }
  }

  function getImageUrl(item: KnowledgeItem) {
    if (!item.image_url) {
      return "";
    }

    if (item.image_url.startsWith("http")) {
      return item.image_url;
    }

    return `${API_URL}${item.image_url}`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        boxSizing: "border-box",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                opacity: 0.65,
                marginBottom: "6px",
              }}
            >
              CURiosityLEARN KNOWLEDGE CENTER
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
              }}
            >
              📚 Information Hub
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                opacity: 0.72,
              }}
            >
              সব subject-এর গুরুত্বপূর্ণ information এক জায়গায়।
            </p>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          )}
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(59,130,246,0.14)",
              border:
                "1px solid rgba(96,165,250,0.22)",
            }}
          >
            {message}
          </div>
        )}

        {userRole === "teacher" && (
          <section
            style={{
              marginBottom: "30px",
              padding: "22px",
              borderRadius: "18px",
              background: "rgba(15,23,42,0.72)",
              border:
                "1px solid rgba(148,163,184,0.16)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingId
                ? "✏️ Edit Information"
                : "➕ Add New Information"}
            </h2>

            <form
              onSubmit={saveItem}
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subject: e.target.value,
                    })
                  }
                  placeholder="Subject"
                  required
                  style={inputStyle}
                />

                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                  placeholder="Category / Chapter"
                  required
                  style={inputStyle}
                />
              </div>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Information title"
                required
                style={inputStyle}
              />

              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                placeholder="Write the complete information here..."
                required
                rows={8}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              <div>
                <label
                  htmlFor="knowledge-image"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    opacity: 0.75,
                  }}
                >
                  🖼️ Image (optional)
                </label>

                <input
                  id="knowledge-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) =>
                    setImage(
                      e.target.files?.[0] || null
                    )
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={primaryButton}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Information"
                    : "Add Information"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={secondaryButton}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              📖 Available Information
            </h2>

            <button
              type="button"
              onClick={() => void loadItems()}
              style={secondaryButton}
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              Loading information...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                borderRadius: "16px",
                background: "rgba(15,23,42,0.55)",
                opacity: 0.75,
              }}
            >
              এখনো কোনো information যোগ করা হয়নি।
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              {items.map((item) => (
                <article
                  key={item.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: "18px",
                    background:
                      "rgba(15,23,42,0.72)",
                    border:
                      "1px solid rgba(148,163,184,0.15)",
                  }}
                >
                  {item.image_url && (
                    <img
                      src={getImageUrl(item)}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "190px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}

                  <div style={{ padding: "18px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={tagStyle}>
                        {item.subject}
                      </span>

                      <span style={tagStyle}>
                        {item.category}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 10px",
                        fontSize: "20px",
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.65,
                        opacity: 0.82,
                      }}
                    >
                      {item.content}
                    </p>

                    {userRole === "teacher" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "16px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(item)
                          }
                          style={secondaryButton}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteItem(item.id)
                          }
                          style={{
                            ...secondaryButton,
                            background:
                              "rgba(127,29,29,0.45)",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(2,6,23,0.55)",
  color: "white",
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  padding: "11px 17px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "rgba(255,255,255,0.07)",
  color: "white",
  cursor: "pointer",
};

const tagStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  background: "rgba(59,130,246,0.15)",
  fontSize: "12px",
  opacity: 0.9,
};