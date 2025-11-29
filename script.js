document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileClose = document.querySelector(".mobile-close");
  const mobileDropdowns = document.querySelectorAll(".mobile-dropdown");
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const supportForm = document.getElementById("supportForm");
  const pricingCards = document.querySelectorAll(".pricing-card");
  const serviceCards = document.querySelectorAll(".service-card");
  const featureCards = document.querySelectorAll(".feature-card");

  function initMobileMenu() {
    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleMobileMenu();
      });

      mobileClose.addEventListener("click", function () {
        closeMobileMenu();
      });

      mobileDropdowns.forEach((dropdown) => {
        const header = dropdown.querySelector(".mobile-dropdown-header");

        header.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const isActive = dropdown.classList.contains("active");

          mobileDropdowns.forEach((other) => {
            if (other !== dropdown) {
              other.classList.remove("active");
            }
          });

          dropdown.classList.toggle("active", !isActive);
        });
      });

      const mobileLinks = document.querySelectorAll(".mobile-nav a[href]");
      mobileLinks.forEach((link) => {
        if (!link.classList.contains("mobile-dropdown-link")) {
          link.addEventListener("click", function (e) {
            closeMobileMenu();
          });
        }
      });

      document.addEventListener("click", function (e) {
        if (
          !mobileMenu.contains(e.target) &&
          !mobileMenuToggle.contains(e.target)
        ) {
          closeMobileMenu();
        }
      });

      mobileMenu.addEventListener("click", function (e) {
        e.stopPropagation();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
          closeMobileMenu();
        }
      });
    }
  }

  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.contains("active");

    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    mobileMenu.classList.add("active");
    mobileMenuToggle.classList.add("active");
    document.body.classList.add("menu-open");

    const overlay = document.createElement("div");
    overlay.className = "mobile-menu-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1999;
      animation: fadeIn 0.3s ease;
    `;

    overlay.addEventListener("click", closeMobileMenu);
    document.body.appendChild(overlay);
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("active");
    mobileMenuToggle.classList.remove("active");
    document.body.classList.remove("menu-open");

    mobileDropdowns.forEach((dropdown) => {
      dropdown.classList.remove("active");
    });

    const overlay = document.querySelector(".mobile-menu-overlay");
    if (overlay) {
      overlay.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => overlay.remove(), 300);
    }
  }

  function initSmoothScroll() {
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#" || !targetId.startsWith("#")) return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();

          const headerHeight = document.querySelector(".navbar").offsetHeight;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          if (mobileMenu.classList.contains("active")) {
            closeMobileMenu();
          }
        }
      });
    });
  }

  //обработка формы
  function initFormHandler() {
    if (supportForm) {
      supportForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = {
          name: document.getElementById("name").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          email: document.getElementById("email").value.trim(),
          message: document.getElementById("message").value.trim(),
        };

        if (!validateForm(formData)) {
          return;
        }

        const submitBtn = supportForm.querySelector(".form-submit");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Отправка...";
        submitBtn.disabled = true;

        try {
          const response = await fetch("https://formcarry.com/s/bNKHtdlam31", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            showNotification(
              "Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.",
              "success"
            );
            supportForm.reset();
          } else {
            throw new Error("Ошибка отправки формы");
          }
        } catch (error) {
          console.error("Error:", error);
          showNotification(
            "Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.",
            "error"
          );
        } finally {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
    }
  }

  function validateForm(data) {
    const errors = [];

    if (!data.name) {
      errors.push("Пожалуйста, введите ваше имя");
      highlightField("name", false);
    } else {
      highlightField("name", true);
    }

    if (!data.phone) {
      errors.push("Пожалуйста, введите ваш телефон");
      highlightField("phone", false);
    } else if (!isValidPhone(data.phone)) {
      errors.push("Пожалуйста, введите корректный номер телефона");
      highlightField("phone", false);
    } else {
      highlightField("phone", true);
    }

    if (!data.email) {
      errors.push("Пожалуйста, введите ваш email");
      highlightField("email", false);
    } else if (!isValidEmail(data.email)) {
      errors.push("Пожалуйста, введите корректный email адрес");
      highlightField("email", false);
    } else {
      highlightField("email", true);
    }

    if (errors.length > 0) {
      showNotification(errors.join("<br>"), "error");
      return false;
    }

    return true;
  }

  function highlightField(fieldId, isValid) {
    const field = document.getElementById(fieldId);
    if (isValid) {
      field.style.borderColor = "#4CAF50";
    } else {
      field.style.borderColor = "#f14d34";
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  function showNotification(message, type) {
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#4CAF50" : "#f14d34"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    const notificationClose = notification.querySelector(".notification-close");
    notificationClose.addEventListener("click", function () {
      notification.style.animation = "slideOutRight 0.3s ease-in";
      setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  //анимации
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-up");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    serviceCards.forEach((card) => {
      observer.observe(card);
    });

    featureCards.forEach((card) => {
      observer.observe(card);
    });

    pricingCards.forEach((card) => {
      observer.observe(card);
    });

    const animatedElements = document.querySelectorAll(
      ".task-card, .team-member, .case-card, .client-logo, .faq-item"
    );
    animatedElements.forEach((el) => {
      observer.observe(el);
    });
  }

  function initPricingInteractions() {
    pricingCards.forEach((card) => {
      card.addEventListener("click", function () {
        const button = this.querySelector("button");
        if (button) {
          button.style.transform = "scale(0.95)";
          setTimeout(() => {
            button.style.transform = "";
          }, 150);

          showNotification(
            "Спасибо за интерес к нашему тарифу! Мы свяжемся с вами для уточнения деталей.",
            "success"
          );
        }
      });
    });
  }

  function initStickyNav() {
    const navbar = document.querySelector(".navbar");
    const hero = document.querySelector(".hero");

    if (navbar && hero) {
      const heroHeight = hero.offsetHeight;
      const navHeight = navbar.offsetHeight;

      function updateNavbar() {
        if (window.scrollY > heroHeight - navHeight) {
          navbar.style.background = "rgba(255, 255, 255, 0.98)";
          navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
        } else {
          navbar.style.background = "rgba(255, 255, 255, 0.95)";
          navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        }
      }

      window.addEventListener("scroll", updateNavbar);
      updateNavbar();
    }
  }

  function initCounters() {
    const counters = document.querySelectorAll(".stat-number");
    const speed = 200;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.textContent);
            let count = 0;

            const updateCount = () => {
              const increment = target / speed;
              if (count < target) {
                count += increment;
                counter.textContent = Math.ceil(count);
                setTimeout(updateCount, 1);
              } else {
                counter.textContent = target;
              }
            };

            updateCount();
            observer.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => {
      observer.observe(counter);
    });
  }

  function initVideoBackground() {
    const video = document.querySelector(".video-bg");
    if (video) {
      video.addEventListener("loadeddata", function () {
        console.log("Видео фон загружен успешно");
      });

      video.addEventListener("error", function () {
        console.log("Ошибка загрузки видео фона");
        document.querySelector(".video-container").style.backgroundImage =
          'url("fallback-image.jpg")';
      });
    }
  }

  function initAll() {
    initMobileMenu();
    initSmoothScroll();
    initFormHandler();
    initScrollAnimations();
    initPricingInteractions();
    initStickyNav();
    initCounters();
    initVideoBackground();

    console.log("Drupal-coder сайт инициализирован успешно!");
  }

  initAll();
});

window.addEventListener("resize", function () {
  if (window.innerWidth > 768) {
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      mobileMenuToggle.classList.remove("active");
      document.body.classList.remove("menu-open");

      const overlay = document.querySelector(".mobile-menu-overlay");
      if (overlay) overlay.remove();
    }
  }
});

//обработка ошибок
window.addEventListener("error", function (e) {
  console.error("Произошла ошибка:", e.error);
});

function initStickyNav() {
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector(".hero");

  if (navbar && hero) {
    function updateNavbar() {
      if (window.scrollY > 100) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", updateNavbar);
    updateNavbar();
  }
}
