document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".count");

    // Function to start the counter animation
    const updateCounter = (counter) => {
        const target = +counter.getAttribute("data-target");
        let current = 0;
        const increment = target / 300; // Adjust speed here

        const countInterval = setInterval(() => {
            current = Math.ceil(current + increment);
            counter.innerText = current;

            if (current >= target) {
                clearInterval(countInterval); // Stop when target is reached
                counter.innerText = target;
            }
        }, 10); // Adjust frame delay here
    };

    // Set up Intersection Observer to trigger animation when the section comes into view
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Once the section comes into view, add 'visible' class to each counter
                const counter = entry.target;
                counter.classList.add("visible");
                updateCounter(counter); // Start counter animation
                observer.unobserve(counter); // Stop observing after animation starts
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the element is in view

    // Observe each counter element
    counters.forEach(counter => {
        observer.observe(counter);
    });
});
