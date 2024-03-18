(function () {
    ("use strict");

    let activeModal = null; // Variable to store the active modal

    // DOM utility functions:
    function getElement(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function getElements(selector, parent = document) {
        return parent.querySelectorAll(selector);
    }

    // Carousel component:
    const carousel = (container) => {
        const carouselContainer = getElement(".carousel", container);

        const slides = getElements(".image", carouselContainer);
        const totalSlides = slides.length;
        let currentIndex = 0; // Start from the second slide

        // Clone the first and last slide and append them respectively to the end and beginning
        const firstSlideClone = slides[0].cloneNode(true);
        const lastSlideClone = slides[totalSlides - 1].cloneNode(true);
        carouselContainer.appendChild(firstSlideClone);
        carouselContainer.insertBefore(lastSlideClone, slides[0]);

        // Animation method:
        const animateCarousel = () => {
            carouselContainer.style.transition = "transform 0.6s ease-in-out";
            carouselContainer.style.transform = `translateX(${
                -currentIndex * 100
            }%)`;
            updateIndicators();
        };

        const updateIndicators = () => {
            let currentIndexIndicator;
            if (currentIndex === 3) {
                currentIndexIndicator = 0;
            } else {
                currentIndexIndicator = currentIndex;
            }
            const indicators = getElements(".carousel-indicators button");
            indicators.forEach((button, index) => {
                if (index === currentIndexIndicator) {
                    button.classList.add("active");
                    button.setAttribute("aria-current", "true");
                } else {
                    button.classList.remove("active");
                    button.removeAttribute("aria-current");
                }
            });
        };

        // Go to previous slide:
        const prevSlide = () => {
            currentIndex--;
            if (currentIndex < 0) {
                carouselContainer.style.transition = "none";
                currentIndex = totalSlides;
                carouselContainer.style.transform = `translateX(${
                    -currentIndex * 100
                }%)`;
                setTimeout(() => {
                    carouselContainer.style.transition =
                        "transform 0.4s ease-in-out";
                    currentIndex--;
                    animateCarousel();
                }, 50);
            } else {
                animateCarousel();
            }
        };

        // Go to next slide:
        const nextSlide = () => {
            currentIndex++;
            if (currentIndex > totalSlides) {
                currentIndex = 0;
                carouselContainer.style.transition = "none";
                carouselContainer.style.transform = `translateX(${
                    -currentIndex * 100
                }%)`;
                setTimeout(() => {
                    currentIndex = 1;
                    carouselContainer.style.transition =
                        "transform 0.4s ease-in-out";
                    animateCarousel();
                }, 50);
            } else {
                animateCarousel();
            }
        };

        const nextButton = getElement(".carousel-control-next");
        nextButton.onclick = nextSlide;

        const prevButton = getElement(".carousel-control-prev");
        prevButton.onclick = prevSlide;

        // Define automatic sliding functionality
        let intervalId;

        const startAutoSlide = () => {
            intervalId = setInterval(nextSlide, 5000); // Adjust interval as needed
        };

        const stopAutoSlide = () => {
            clearInterval(intervalId);
        };

        // Get carousel container
        const carouselParent = document.getElementById("carouselId");

        // Add event listeners for mouseover and mouseout on the carousel container
        carouselParent.addEventListener("mouseover", () => {
            stopAutoSlide();
        });

        carouselParent.addEventListener("mouseout", () => {
            startAutoSlide();
        });

        // Start automatic sliding initially
        startAutoSlide();
    };

    // Initialize carousels:
    getElements(".carousel-container").forEach(carousel);

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
    // event.preventDefault();
    // Remove 'active-tag' class from the currently active 'li' element
    const currentActiveTag = document.querySelector(".nav-link.active-tag");
    currentActiveTag.classList.remove("active-tag");

    // Add 'active-tag' class to the clicked 'li' element
    clickedTag.classList.add("active-tag");

    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach((item) => {
        const containerGChild = item.closest(".containerGChild");
        if (tag === "All" || item.dataset.galleryTag === tag) {
            containerGChild.style.display = "block";
            const children = containerGChild.children;
            if (children) {
                Array.from(children).forEach((child) =>
                    child.classList.add("active-gallery-item")
                );
            }
        } else {
            containerGChild.style.display = "none";
        }
    });
}
