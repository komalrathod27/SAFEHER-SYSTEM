import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function SafetyArticles() {
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(false);
  const [editingArticleStatus, setEditingArticleStatus] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);

  useEffect(() => {
    getSafetyArticles();
  }, []);

  const getSafetyArticles = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/getsafetyarticles",
      );
      setArticles(response.data);
      setFilteredArticles(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const totalArticles = articles.length;

  const publishedArticles = articles.filter(
    (article) => article.status === "Published",
  ).length;

  const draftArticles = articles.filter(
    (article) => article.status === "Draft",
  ).length;

  useEffect(() => {
    window.viewSafetyArticle = viewSafetyArticle;
    window.editSafetyArticle = editSafetyArticle;
    window.deleteSafetyArticle = deleteSafetyArticle;
    window.addSafetyArticle = addSafetyArticle;
    window.closeArticleModal = closeArticleModal;
    window.closeArticleForm = closeArticleForm;
    window.saveArticleAsDraft = saveArticleAsDraft;
    window.publishSafetyArticle = publishSafetyArticle;

    const imageInput = document.getElementById("articleImage");

    if (imageInput) {
      imageInput.addEventListener("change", previewArticleImage);
    }

    return () => {
      if (imageInput) {
        imageInput.removeEventListener("change", previewArticleImage);
      }

      delete window.viewSafetyArticle;
      delete window.editSafetyArticle;
      delete window.deleteSafetyArticle;
      delete window.addSafetyArticle;
      delete window.closeArticleModal;
      delete window.closeArticleForm;
      delete window.saveArticleAsDraft;
      delete window.publishSafetyArticle;
    };
  }, []);

  // ==========================================
  // VIEW ARTICLE
  // ==========================================

  async function viewSafetyArticle(id) {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/getsafetyarticle/${id}`,
      );

      const article = response.data;

      document.getElementById("viewArticleImage").src = article.image
        ? `http://localhost:3000/articles/${article.image}`
        : "";

      document.getElementById("viewArticleTitle").innerText = article.title;

      document.getElementById("viewArticleCategory").innerText =
        article.category;

      document.getElementById("viewArticleStatus").innerText = article.status;

      document.getElementById("viewArticleUpdated").innerText = new Date(
        article.updatedAt,
      ).toLocaleDateString();

      document.getElementById("viewArticleShortDescription").innerText =
        article.shortDescription;

      document.getElementById("viewArticleContent").innerText = article.content;

      document.getElementById("viewArticleModal").style.display = "flex";
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Error while loading article.");
    }
  }

  // ==========================================
  // CLOSE VIEW MODAL
  // ==========================================

  function closeArticleModal() {
    const modal = document.getElementById("viewArticleModal");

    if (modal) {
      modal.style.display = "none";
    }
  }

  // ==========================================
  // ADD ARTICLE
  // ==========================================

  function addSafetyArticle() {
    setEditingArticle(false);
    setEditingArticleStatus("");
    document.getElementById("articleFormTitle").innerText =
      "Add Safety Article";

    document.getElementById("articleId").value = "";
    document.getElementById("articleTitle").value = "";
    document.getElementById("articleCategoryForm").value = "Personal Safety";
    document.getElementById("articleImage").value = "";
    document.getElementById("articleShortDescription").value = "";
    document.getElementById("articleContent").value = "";

    const imagePreview = document.getElementById("articleImagePreview");
    imagePreview.src = "";
    document.getElementById("articleImagePreviewBox").style.display = "none";

    document.getElementById("articleFormModal").style.display = "flex";
  }

  // EDIT ARTICLE
  async function editSafetyArticle(id) {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/getsafetyarticle/${id}`,
      );
      const article = response.data;
      setEditingArticle(true);
      setEditingArticleStatus(article.status);
      document.getElementById("articleFormTitle").innerText =
        "Edit Safety Article";
      document.getElementById("articleId").value = article._id;
      document.getElementById("articleTitle").value = article.title;
      document.getElementById("articleCategoryForm").value = article.category;
      document.getElementById("articleShortDescription").value =
        article.shortDescription;
      document.getElementById("articleContent").value = article.content;

      // Show existing image
      if (article.image) {
        document.getElementById("articleImagePreview").src =
          `http://localhost:3000/articles/${article.image}`;
        document.getElementById("articleImagePreviewBox").style.display =
          "block";
      } else {
        document.getElementById("articleImagePreview").src = "";
        document.getElementById("articleImagePreviewBox").style.display =
          "none";
      }

      // Open modal
      document.getElementById("articleFormModal").style.display = "flex";
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error while loading article.");
    }
  }

  // DELETE ARTICLE
  async function deleteSafetyArticle(id) {
    const result = await Swal.fire({
      title: "Delete Safety Article?",
      text: "This article and its image will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/deletesafetyarticle/${id}`);
      await Swal.fire({
        title: "Deleted!",
        text: "Safety article deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
      getSafetyArticles();
    } catch (error) {
      console.log(error);

      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Error while deleting safety article.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // IMAGE PREVIEW
  function previewArticleImage(event) {
    const file = event.target.files[0];

    if (!file) return;

    const imagePreview = document.getElementById("articleImagePreview");

    const previewBox = document.getElementById("articleImagePreviewBox");

    imagePreview.src = URL.createObjectURL(file);

    previewBox.style.display = "block";
  }

  // ==========================================
  // CLOSE ARTICLE FORM
  // ==========================================

  function closeArticleForm() {
    const modal = document.getElementById("articleFormModal");

    if (modal) {
      modal.style.display = "none";
    }
  }

  // ==========================================
  // GET FORM DATA
  // ==========================================

  function getArticleFormData() {
    const title = document.getElementById("articleTitle").value.trim();

    const category = document.getElementById("articleCategoryForm").value;

    const image = document.getElementById("articleImage").files[0];

    const shortDescription = document
      .getElementById("articleShortDescription")
      .value.trim();

    const content = document.getElementById("articleContent").value.trim();

    if (!title || !category || !shortDescription || !content) {
      alert("Please fill all required fields.");
      return null;
    }

    return {
      title,
      category,
      image,
      shortDescription,
      content,
    };
  }

  // ==========================================
  // SEARCH & FILTER
  // ==========================================

  function searchSafetyArticles() {
    const searchText =
      document.getElementById("articleSearch")?.value.toLowerCase().trim() ||
      "";

    const category = document.getElementById("articleCategory")?.value || "All";

    const status = document.getElementById("articleStatus")?.value || "All";

    const filtered = articles.filter((article) => {
      const title = (article.title || "").toLowerCase();
      const articleCategory = (article.category || "").toLowerCase();

      const matchesSearch =
        searchText === "" ||
        title.includes(searchText) ||
        articleCategory.includes(searchText);

      const matchesCategory =
        category === "All" || article.category === category;

      const matchesStatus = status === "All" || article.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    setFilteredArticles(filtered);
  }

  // ==========================================
  // SAVE AS DRAFT
  // ==========================================

  async function saveArticleAsDraft() {
    const articleData = getArticleFormData();

    if (!articleData) return;

    try {
      const formData = new FormData();

      formData.append("title", articleData.title);
      formData.append("category", articleData.category);
      formData.append("shortDescription", articleData.shortDescription);
      formData.append("content", articleData.content);
      const articleId = document.getElementById("articleId").value;
      const status = editingArticle ? editingArticleStatus : "Draft";
      formData.append("status", status);

      if (articleData.image) {
        formData.append("image", articleData.image);
      }

      if (articleId) {
        // Update existing article
        await axios.put(
          `http://localhost:3000/api/editsafetyarticle/${articleId}`,
          formData,
        );

        alert("Article updated as draft successfully.");
      } else {
        // Add new article
        await axios.post(
          "http://localhost:3000/api/addsafetyarticle",
          formData,
        );
        alert("Article saved as draft successfully.");
      }
      setEditingArticle(false);
      setEditingArticleStatus("");
      closeArticleForm();
      getSafetyArticles();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error while saving article.");
    }
  }

  // ==========================================
  // PUBLISH ARTICLE
  // ==========================================

  async function publishSafetyArticle() {
    const articleData = getArticleFormData();

    if (!articleData) return;

    try {
      const formData = new FormData();

      formData.append("title", articleData.title);
      formData.append("category", articleData.category);
      formData.append("shortDescription", articleData.shortDescription);
      formData.append("content", articleData.content);
      formData.append("status", "Published");

      if (articleData.image) {
        formData.append("image", articleData.image);
      }

      const articleId = document.getElementById("articleId").value;

      if (articleId) {
        // Update existing article
        await axios.put(
          `http://localhost:3000/api/editsafetyarticle/${articleId}`,
          formData,
        );

        alert("Article published successfully.");
      } else {
        // Add new article
        await axios.post(
          "http://localhost:3000/api/addsafetyarticle",
          formData,
        );

        alert("Article published successfully.");
      }
      closeArticleForm();
      getSafetyArticles();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error while publishing article.");
    }
  }

  return (
    <div className="content-wrapper">
      {/* Page Header */}

      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="font-weight-bold mb-0">Safety Articles</h4>

              <p className="text-muted mb-0">
                Create and manage safety articles for women users.
              </p>
            </div>

            <button className="btn btn-primary" onClick={addSafetyArticle}>
              <i className="mdi mdi-plus mr-1"></i>
              Add Article
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="row">
        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Total Articles</p>

              <h3 id="totalArticlesCount">{totalArticles}</h3>

              <p className="text-primary mb-0">Available articles</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Published</p>

              <h3 id="publishedArticlesCount">{publishedArticles}</h3>

              <p className="text-success mb-0">Visible to women users</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <p className="card-title text-muted">Drafts</p>

              <h3 id="draftArticlesCount">{draftArticles}</h3>

              <p className="text-warning mb-0">Not currently published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-5">
                  <label>Search Articles</label>

                  <input
                    type="text"
                    id="articleSearch"
                    className="form-control"
                    placeholder="Search by title or category..."
                    onKeyUp={searchSafetyArticles}
                  />
                </div>

                <div className="col-md-4">
                  <label>Category</label>

                  <select
                    id="articleCategory"
                    className="form-control"
                    onChange={searchSafetyArticles}
                  >
                    <option value="All">All Categories</option>

                    <option value="Personal Safety">Personal Safety</option>

                    <option value="Digital Safety">Digital Safety</option>

                    <option value="Emergency">Emergency</option>

                    <option value="Travel Safety">Travel Safety</option>

                    <option value="Workplace Safety">Workplace Safety</option>

                    <option value="Self-Defence Basics">
                      Self-Defence Basics
                    </option>

                    <option value="Cybercrime Awareness">
                      Cybercrime Awareness
                    </option>

                    <option value="Legal Awareness">Legal Awareness</option>

                    <option value="Public Safety">Public Safety</option>

                    <option value="Health & Wellbeing">
                      Health & Wellbeing
                    </option>
                    <option value="Home Safety">Home Safety</option>

                    <option value="Financial Safety">Financial Safety</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label>Status</label>

                  <select
                    id="articleStatus"
                    className="form-control"
                    onChange={searchSafetyArticles}
                  >
                    <option value="All">All Status</option>

                    <option value="Published">Published</option>

                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">All Safety Articles</h4>

                <span className="text-muted">
                  Published articles appear on the Women User side
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Article ID</th>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody id="safetyArticlesTable">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No safety articles available.
                        </td>
                      </tr>
                    ) : (
                      filteredArticles.map((article, index) => (
                        <tr key={article._id}>
                          <td>{index + 1}</td>

                          <td>
                            {article.title.length > 30
                              ? article.title.substring(0, 30) + ".."
                              : article.title}
                          </td>

                          <td>{article.category}</td>

                          <td>
                            <span
                              className={
                                article.status === "Published"
                                  ? "badge badge-success"
                                  : "badge badge-warning"
                              }
                            >
                              {article.status}
                            </span>
                          </td>

                          <td>
                            {new Date(article.updatedAt).toLocaleDateString()}
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => viewSafetyArticle(article._id)}
                            >
                              <i className="mdi mdi-eye mr-1"></i>
                              View
                            </button>

                            <button
                              className="btn btn-sm btn-primary ml-2"
                              onClick={() => editSafetyArticle(article._id)}
                            >
                              <i className="mdi mdi-pencil mr-1"></i>
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-danger ml-2"
                              onClick={() => deleteSafetyArticle(article._id)}
                            >
                              <i className="mdi mdi-delete mr-1"></i>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Article Modal */}
      <div
        id="viewArticleModal"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050,
        }}
      >
        <div
          className="card"
          style={{
            width: "750px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: "10px",
          }}
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">Article Details</h4>

              <button
                type="button"
                onClick={closeArticleModal}
                aria-label="Close"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#f1f3f5",
                  color: "#495057",
                  fontSize: "20px",
                  lineHeight: "34px",
                  textAlign: "center",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <img
              id="viewArticleImage"
              src=""
              alt="Article"
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            />

            <h3 id="viewArticleTitle"></h3>

            <div className="mb-3">
              <span
                id="viewArticleCategory"
                className="badge badge-info mr-2"
              ></span>

              <span
                id="viewArticleStatus"
                className="badge badge-success mr-2"
              ></span>
            </div>

            <p className="text-muted">
              Updated: <span id="viewArticleUpdated"></span>
            </p>

            <hr />

            <h5>Short Description</h5>

            <p id="viewArticleShortDescription" className="text-muted"></p>

            <h5 className="mt-4">Full Article</h5>

            <p
              id="viewArticleContent"
              style={{
                whiteSpace: "pre-line",
                lineHeight: "1.8",
              }}
            ></p>
          </div>
        </div>
      </div>

      {/* Add / Edit Article Modal */}

      <div
        id="articleFormModal"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050,
        }}
      >
        <div
          className="card"
          style={{
            width: "750px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: "10px",
          }}
        >
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 id="articleFormTitle" className="card-title mb-0">
                Add Safety Article
              </h4>

              <button
                type="button"
                onClick={closeArticleForm}
                aria-label="Close"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#f1f3f5",
                  color: "#495057",
                  fontSize: "20px",
                  lineHeight: "34px",
                  textAlign: "center",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <input type="hidden" id="articleId" />

            {/* Article Title */}

            <div className="form-group">
              <label>Article Title</label>

              <input
                type="text"
                id="articleTitle"
                className="form-control"
                placeholder="Enter article heading"
              />
            </div>

            {/* Category */}

            <div className="form-group">
              <label>Category</label>

              <select id="articleCategoryForm" className="form-control">
                <option value="Personal Safety">Personal Safety</option>

                <option value="Digital Safety">Digital Safety</option>

                <option value="Emergency">Emergency</option>

                <option value="Travel Safety">Travel Safety</option>

                <option value="Workplace Safety">Workplace Safety</option>

                <option value="Self-Defence Basics">Self-Defence Basics</option>

                <option value="Cybercrime Awareness">
                  Cybercrime Awareness
                </option>
                <option value="Legal Awareness">Legal Awareness</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Health & Wellbeing">Health & Wellbeing</option>
                <option value="Home Safety">Home Safety</option>
                <option value="Financial Safety">Financial Safety</option>
              </select>
            </div>

            {/* Image Upload */}

            <div className="form-group">
              <label>Article Image</label>

              <input
                type="file"
                id="articleImage"
                className="form-control"
                accept="image/*"
              />

              <small className="text-muted">
                Select an image related to the article.
              </small>
            </div>

            {/* Image Preview */}

            <div
              id="articleImagePreviewBox"
              className="mb-4"
              style={{
                display: "none",
              }}
            >
              <label>Image Preview</label>

              <div>
                <img
                  id="articleImagePreview"
                  src=""
                  alt="Preview"
                  style={{
                    width: "180px",
                    height: "110px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>

            {/* Short Description */}

            <div className="form-group">
              <label>Short Description</label>

              <textarea
                id="articleShortDescription"
                className="form-control"
                rows="3"
                placeholder="Enter short description shown on article cards"
              ></textarea>
            </div>

            {/* Full Article */}

            <div className="form-group">
              <label>Full Article Content</label>

              <textarea
                id="articleContent"
                className="form-control"
                rows="9"
                placeholder="Write the complete safety article..."
              ></textarea>
            </div>

            {/* Action Buttons */}

            <div className="text-right mt-4">
              <button
                type="button"
                className="btn btn-light mr-2"
                onClick={closeArticleForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-warning mr-2"
                onClick={saveArticleAsDraft}
              >
                <i className="mdi mdi-content-save-outline mr-1"></i>

                {editingArticle ? "Save Changes" : "Save as Draft"}
              </button>

              {(!editingArticle || editingArticleStatus === "Draft") && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={publishSafetyArticle}
                >
                  <i className="mdi mdi-publish mr-1"></i>
                  {editingArticle ? "Publish Article" : "Publish Article"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SafetyArticles;
