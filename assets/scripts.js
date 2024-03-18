(function () {
    ("use strict");

    let activeModal = null; // Variable to store the active modal

    function initializeCarousel() {
        const carousels = document.querySelectorAll(".carousel-container");

        carousels.forEach((container) => {
            const getElement = (selector, parent = container) =>
                parent.querySelector(selector);
            const getElements = (selector, parent = container) =>
                parent.querySelectorAll(selector);
            const createElement = (tag, prop) =>
                Object.assign(document.createElement(tag), prop);

            // Helper function:
            const mod = (n, m) => ((n % m) + m) % m;

            // Carousel component:
            const carousel = getElement(".carousel", container);
            const carouselSlider = getElement(".carousel-slider", carousel);
            const slides = getElements(".carousel-slide", carouselSlider);
            const buttons = [];

            let c = 0;
            const totalSlides = slides.length;

            if (totalSlides < 2) return;

            // Methods:
            const animate = (ms = 500) => {
                const cMod = mod(c, totalSlides);
                carouselSlider.style.transitionDuration = `${ms}ms`;
                carouselSlider.style.transform = `translateX(${
                    (-c - 1) * 100
                }%)`;
                slides.forEach((slide, i) =>
                    slide.classList.toggle("is-active", cMod === i)
                );
                buttons.forEach((button, i) =>
                    button.classList.toggle("active", cMod === i)
                );
            };

            const prev = () => {
                if (c <= -1) return;
                c -= 1;
                animate();
            };

            const next = () => {
                if (c >= totalSlides) return;
                c += 1;
                animate();
            };

            const goTo = (index) => {
                c = index;
                animate();
            };

            const play = () => {
                intervalId = setInterval(next, 5000);
            };

            const stop = () => {
                clearInterval(intervalId);
            };

            // Buttons:
            const prevButton = createElement("button", {
                type: "button",
                className: "carousel-prev carousel-control-prev-icon",
                innerHTML: "<span class='visually-hidden'>Previous</span>",
                onclick: () => prev(),
            });
            prevButton.setAttribute("aria-label", "prevButton");

            const nextButton = createElement("button", {
                type: "button",
                className: "carousel-next carousel-control-next-icon",
                innerHTML: "<span class='visually-hidden'>Next</span>",
                onclick: () => next(),
            });
            nextButton.setAttribute("aria-label", "nextButton");

            // Navigation:
            const navigation = createElement("div", {
                className: "carousel-indicators",
            });

            // Navigation bullets:
            for (let i = 0; i < totalSlides; i++) {
                const button = createElement("button", {
                    type: "button",
                    onclick: () => goTo(i),
                });
                // Set the data-bs-target attribute
                button.setAttribute("data-bs-target", i);
                button.setAttribute("aria-label", `Slide ${i + 1}`);
                button.setAttribute("aria-current", "false");
                buttons.push(button);
            }

            // Events:
            carouselSlider.addEventListener("transitionend", () => {
                if (c <= -1) c = totalSlides - 1;
                if (c >= totalSlides) c = 0;
                animate(0);
            });

            carousel.addEventListener("mouseover", () => stop());
            carousel.addEventListener("mouseout", () => play());

            // Init:
            navigation.append(...buttons);
            carousel.append(prevButton, nextButton, navigation);

            carouselSlider.prepend(slides[totalSlides - 1].cloneNode(true));
            carouselSlider.append(slides[0].cloneNode(true));

            animate(0);
            play();
        });
    }

    initializeCarousel();

    // Function to set up event listeners
    function setupEventListeners() {
        gallery.addEventListener("click", function (event) {
            const target = event.target;

            if (target.classList.contains("gallery-item")) {
                openModal(target); // Open modal when an image is clicked
            }
        });
    }

    setupEventListeners(); // Set up event listeners

    // Function to open the modal
    function openModal(element) {
        // Check if there's an active modal, close it if exists
        if (activeModal) {
            closeModal(activeModal);
        }

        //Check if there's a class to adapt content of the modal
        const activeTags = document.querySelectorAll(".active-gallery-item");
        let images;

        if (activeTags.length !== 0) {
            images = activeTags;
        } else {
            images = document.querySelectorAll(".gallery-item");
        }

        let currentIndex = Array.from(images).findIndex(
            (img) => img.src === element.src
        );

        const modal = document.createElement("div");
        const modalBackdrop = document.createElement("div");
        modal.classList.add("modal", "fade", "show");
        modalBackdrop.classList.add("modal-backdrop", "fade", "show");
        modal.innerHTML = `
                <div class="modal-content modal-dialog modal-body" role="document">
                    <div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">&lt;</div>
                    <img class="modal-image img-fluid" src="${element.src}" alt="Contenu de l'image affichée dans la modale au clique"/>
                    <div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">&gt;</div>
                </div>
            `;
        document.body.appendChild(modal);
        document.body.appendChild(modalBackdrop);
        activeModal = modal; // Set the active modal

        // Apply black background
        document.body.classList.add("modal-open");

        // Close the modal when the user clicks outside of it
        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });

        const modalImage = modal.querySelector(".modal-image");
        const mgPrev = modal.querySelector(".mg-prev");
        const mgNext = modal.querySelector(".mg-next");

        // Function to close the modal
        function closeModal(modal) {
            document.body.removeChild(modal);
            document.body.removeChild(modalBackdrop);
            activeModal = null; // Reset active modal
            document.body.classList.remove("modal-open"); // Remove black background
        }

        // Event listener for previous arrow
        mgPrev.addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            modalImage.src = images[currentIndex].src;
        });

        // Event listener for next arrow
        mgNext.addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % images.length;
            modalImage.src = images[currentIndex].src;
        });
    }
})();

function filterGallery(tag, clickedTag) {
    // Remove 'active-tag' class from the currently active 'li' element
    const currentActiveTag = document.querySelector(".nav-link.active-tag");
    currentActiveTag.classList.remove("active-tag");

    // Add 'active-tag' class to the clicked 'li' element
    clickedTag.classList.add("active-tag");

    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach((item) => {
        const galleryContainerChild = item.closest("#galleryContainerChild");
        if (tag === "All" || item.dataset.galleryTag === tag) {
            galleryContainerChild.style.display = "block";
            const children = galleryContainerChild.children;
            if (children) {
                Array.from(children).forEach((child) =>
                    child.classList.add("active-gallery-item")
                );
            }
        } else {
            galleryContainerChild.style.display = "none";
        }
    });
}
