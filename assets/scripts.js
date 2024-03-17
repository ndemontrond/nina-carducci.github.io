(function () {
    "use strict";

    let activeModal = null; // Variable to store the active modal

    // Function for creating a responsive image gallery
    function mauGallery(selector, options) {
        // Select the gallery container element
        const gallery = document.querySelector(selector);

        // Default options for the gallery
        const defaults = {
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3,
            },
            showTags: true,
            tagsPosition: "top",
        };

        // Merge provided options with defaults
        options = Object.assign({}, defaults, options);

        // Collection to hold unique tags
        const tagsCollection = [];
        // DOM utility functions:
        const getElement = (selector, parent = document) =>
            parent.querySelector(selector);
        const getElements = (selector, parent = document) =>
            parent.querySelectorAll(selector);
        // const createNewElement = (tag, props) =>
        //     Object.assign(document.createElement(tag), props);

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
                carouselContainer.style.transition =
                    "transform 0.6s ease-in-out";
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

            // Start automatic sliding
            let intervalId;
            const startAutoSlide = () => {
                intervalId = setInterval(nextSlide, 5000); // Adjust interval as needed
            };

            const stopAutoSlide = () => {
                clearInterval(intervalId);
            };

            // Start automatic sliding when mouse enters the carousel
            carouselContainer.addEventListener("mouseenter", stopAutoSlide);
            // Stop automatic sliding when mouse leaves the carousel
            carouselContainer.addEventListener("mouseleave", startAutoSlide);

            // Start automatic sliding initially
            startAutoSlide();
        };
        

        // Initialize carousels:
        getElements(".carousel-container").forEach(carousel);

        // Initialize the gallery
        initializeGallery();

        // Helper functions

        // Function to initialize the gallery
        function initializeGallery() {
            createRowWrapper(); // Create a row wrapper for gallery items
            setupEventListeners(); // Set up event listeners
            processGalleryItems(); // Process gallery items
            if (options.showTags) {
                showItemTags(); // Show tags if enabled
            }
            gallery.style.display = "block"; // Show the gallery
        }

        // Function to create a row wrapper for gallery items
        function createRowWrapper() {
            if (!gallery.querySelector(".row")) {
                const rowWrapper = document.createElement("div");
                rowWrapper.classList.add("gallery-items-row", "row");
                gallery.appendChild(rowWrapper);
            }
        }

        // Function to process gallery items
        function processGalleryItems() {
            gallery.querySelectorAll(".gallery-item").forEach((item) => {
                responsiveImageItem(item); // Make images responsive
                moveItemInRowWrapper(item); // Move items into the row wrapper
                wrapItemInColumn(item); // Wrap items in columns
                const theTag = item.dataset.galleryTag;
                if (
                    options.showTags &&
                    theTag !== undefined &&
                    !tagsCollection.includes(theTag)
                ) {
                    tagsCollection.push(theTag); // Collect unique tags
                }
            });
        }

        // Function to make images responsive
        function responsiveImageItem(element) {
            if (element.tagName === "IMG") {
                element.classList.add("img-fluid");
            }
        }

        // Function to wrap item in a column
        function wrapItemInColumn(element) {
            const itemColumn = document.createElement("div");
            let columnClasses = `item-column mb-4`;
            if (typeof options.columns === "number") {
                columnClasses += ` col-${Math.ceil(12 / options.columns)}`;
            } else if (typeof options.columns === "object") {
                for (const breakpoint in options.columns) {
                    columnClasses += ` col-${breakpoint}-${Math.ceil(
                        12 / options.columns[breakpoint]
                    )}`;
                }
            } else {
                console.error(
                    `Columns should be defined as numbers or objects. ${typeof options.columns} is not supported.`
                );
                return;
            }
            itemColumn.className = columnClasses;
            element.parentNode.insertBefore(itemColumn, element);
            itemColumn.appendChild(element);
        }

        // Function to move item in the row wrapper
        function moveItemInRowWrapper(element) {
            const rowWrapper = gallery.querySelector(".gallery-items-row");
            rowWrapper.appendChild(element);
        }

        // Function to show tags
        function showItemTags() {
            let tagItems = `<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>`;
            tagsCollection.forEach((value) => {
                tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
            });
            const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

            if (options.tagsPosition === "bottom") {
                gallery.insertAdjacentHTML("beforeend", tagsRow);
            } else if (options.tagsPosition === "top") {
                gallery.insertAdjacentHTML("afterbegin", tagsRow);
            } else {
                console.error(`Unknown tags position: ${options.tagsPosition}`);
            }
        }

        // Function to set up event listeners
        function setupEventListeners() {
            gallery.addEventListener("click", function (event) {
                const target = event.target;
                if (target.classList.contains("nav-link")) {
                    filterByTag(target.dataset.imagesToggle); // Filter by tag when a tag is clicked
                } else if (target.classList.contains("gallery-item")) {
                    openModal(target); // Open modal when an image is clicked
                }
            });
        }

        // Function to open the modal
        function openModal(element) {
            // Check if there's an active modal, close it if exists
            if (activeModal) {
                closeModal(activeModal);
            }

            const images = document.querySelectorAll(".gallery-item");
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
                currentIndex =
                    (currentIndex - 1 + images.length) % images.length;
                modalImage.src = images[currentIndex].src;
            });

            // Event listener for next arrow
            mgNext.addEventListener("click", function () {
                currentIndex = (currentIndex + 1) % images.length;
                modalImage.src = images[currentIndex].src;
            });
        }

        // Function to filter gallery items by tag
        function filterByTag(tag) {
            const activeTags = gallery.querySelectorAll(".active-tag");
            activeTags.forEach((tag) =>
                tag.classList.remove("active", "active-tag")
            );

            const galleryItems = gallery.querySelectorAll(".gallery-item");
            galleryItems.forEach((item) => {
                const parentColumn = item.closest(".item-column");
                if (tag === "all" || item.dataset.galleryTag === tag) {
                    parentColumn.style.display = "block";
                } else {
                    parentColumn.style.display = "none";
                }
            });

            const selectedTag = gallery.querySelector(
                `[data-images-toggle="${tag}"]`
            );
            if (selectedTag) {
                selectedTag.classList.add("active", "active-tag");
            }
        }
    }

    // Initialize the gallery plugin with the selector and options
    mauGallery(".gallery", {
        columns: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
        },
        showTags: true,
        tagsPosition: "top",
    });
})();
