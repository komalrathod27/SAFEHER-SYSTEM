import React, { useEffect, useState } from "react";
import "../safeher-css/safetyresources.css";
import axios from "axios";

function SafetyResources() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    getSafetyArticles();
  }, []);

  async function getSafetyArticles() {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/getsafetyarticles",
      );

      const publishedArticles = response.data.filter(
        (article) => article.status === "Published",
      );

      setArticles(publishedArticles);
    } catch (error) {
      console.log(error);
    }
  }

  const categories = [
    {
      icon: "fa-solid fa-shield-halved",
      title: "Personal Safety",
      text: "Practical tips to help you stay aware and prepared.",
    },
    {
      icon: "fa-solid fa-lock",
      title: "Digital Safety",
      text: "Protect your accounts, privacy and personal information.",
    },
    {
      icon: "fa-solid fa-plane",
      title: "Travel Safety",
      text: "Useful guidance for safer travel and unfamiliar places.",
    },
    {
      icon: "fa-solid fa-truck-medical",
      title: "Emergency",
      text: "Know what to do when you face an emergency.",
    },
    {
      icon: "fa-solid fa-briefcase",
      title: "Workplace Safety",
      text: "Learn simple practices for staying safe at work.",
    },
    {
      icon: "fa-solid fa-person-running",
      title: "Self-Defence Basics",
      text: "Understand basic awareness and personal protection.",
    },
  ];

  function exploreCategory(category) {
    setSelectedCategory(category);

    setTimeout(() => {
      const articlesSection = document.getElementById("safety-articles");

      if (articlesSection) {
        articlesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }

  function backToCategories() {
    setSelectedCategory("All");

    setTimeout(() => {
      const articlesSection = document.getElementById("safety-articles");

      if (articlesSection) {
        articlesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  }

  function readArticle(article) {
    setSelectedArticle(article);
  }

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  const categoryNames = categories.map((category) => category.title);

  const remainingCategoryArticles = [];

  const usedArticleCategories = new Set();

  articles.forEach((article) => {
    if (
      !categoryNames.includes(article.category) &&
      !usedArticleCategories.has(article.category)
    ) {
      usedArticleCategories.add(article.category);
      remainingCategoryArticles.push(article);
    }
  });

  const featuredArticles = remainingCategoryArticles.slice(0, 6);

  return (
    <div className="safeher-safety-resources">
      {/* ================= HERO ================= */}
      <section className="resources-hero">
        <div className="container">
          <div className="resources-hero-content">
            <span className="resources-hero-label">
              <i className="fa-solid fa-book-open"></i>
              SAFEHER KNOWLEDGE HUB
            </span>

            <h1>Safety Resources</h1>

            <p>
              Learn practical safety tips, emergency guidance and useful
              information to help you stay informed, prepared and confident.
            </p>

            <div className="resources-hero-badge">
              <i className="fa-solid fa-circle-check"></i>

              <span>Learn • Prepare • Stay Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTRO ================= */}
      <section className="resources-intro">
        <div className="container">
          <div className="resources-intro-box">
            <div className="intro-icon">
              <i className="fa-solid fa-lightbulb"></i>
            </div>

            <div>
              <span>SAFETY KNOWLEDGE</span>

              <h2>Knowledge Can Help You Stay Prepared</h2>

              <p>
                Explore SafeHer resources covering everyday safety, travel,
                digital security, emergencies and more. Use these resources to
                improve awareness and make informed safety decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="resources-categories">
        <div className="container">
          <div className="resources-section-title">
            <span>EXPLORE TOPICS</span>

            <h2>Safety Categories</h2>

            <p>
              Explore safety information based on different situations and
              everyday needs.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <div className="category-card" key={index}>
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>

                <h3>{category.title}</h3>

                <p>{category.text}</p>

                <button
                  className="category-arrow"
                  onClick={() => exploreCategory(category.title)}
                >
                  Explore
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ARTICLES ================= */}
      <section className="articles-section" id="safety-articles">
        <div className="container">
          <div className="resources-section-title">
            {selectedCategory !== "All" && (
              <button
                type="button"
                className="category-back-button"
                onClick={backToCategories}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to All Articles
              </button>
            )}

            <span>SAFETY ARTICLES</span>

            <h2>
              {selectedCategory === "All"
                ? "Learn Something That Can Help You"
                : `${selectedCategory} Articles`}
            </h2>

            <p>
              {selectedCategory === "All"
                ? "Helpful articles covering common safety situations and practical everyday guidance."
                : `Explore helpful articles and practical guidance about ${selectedCategory.toLowerCase()}.`}
            </p>
          </div>
          <div className="articles-grid">
            {(selectedCategory === "All" ? featuredArticles : filteredArticles)
              .length === 0 ? (
              <div className="text-center w-100">
                <p className="text-muted">
                  No published articles available for this category.
                </p>
              </div>
            ) : (
              (selectedCategory === "All"
                ? featuredArticles
                : filteredArticles
              ).map((article) => (
                <article className="article-card" key={article._id}>
                  <div className="article-image">
                    {article.image ? (
                      <img
                        src={`http://localhost:3000/articles/${article.image}`}
                        alt={article.title}
                      />
                    ) : (
                      <div className="article-no-image">
                        <i className="fa-solid fa-book-open"></i>
                      </div>
                    )}

                    <span>{article.category}</span>
                  </div>

                  <div className="article-content">
                    <h3>{article.title}</h3>

                    <p>{article.shortDescription}</p>

                    <button
                      type="button"
                      className="read-more"
                      onClick={() => readArticle(article)}
                    >
                      Read Article
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {selectedArticle && (
        <div className="article-modal">
          <div className="article-modal-content">
            <button
              type="button"
              className="article-modal-close"
              onClick={() => setSelectedArticle(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {selectedArticle.image && (
              <img
                src={`http://localhost:3000/articles/${selectedArticle.image}`}
                alt={selectedArticle.title}
              />
            )}

            <span>{selectedArticle.category}</span>
            <h2>{selectedArticle.title}</h2>
            <p>{selectedArticle.content}</p>
          </div>
        </div>
      )}

      {/* ================= EMERGENCY GUIDE ================= */}
      <section className="quick-guide-section">
        <div className="container">
          <div className="quick-guide">
            <div className="quick-guide-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <div className="quick-guide-content">
              <span>QUICK EMERGENCY GUIDE</span>

              <h2>If You Are in Immediate Danger</h2>

              <p>
                Move to a safer location if possible, contact appropriate
                emergency services and reach out to trusted people who can
                support you.
              </p>
            </div>

            <div className="guide-steps">
              <div>
                <strong>01</strong>
                <span>Stay Calm</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Move to Safety</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Seek Help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= REMINDER ================= */}
      <section className="safety-reminder-section">
        <div className="container">
          <div className="safety-reminder">
            <div className="reminder-icon">
              <i className="fa-solid fa-heart"></i>
            </div>

            <div>
              <h3>Your Safety Matters</h3>

              <p>
                Use safety information as a guide, trust your instincts and seek
                appropriate help when necessary.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SafetyResources;
