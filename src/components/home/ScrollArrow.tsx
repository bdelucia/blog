import useVerticalScroll from "../../hooks/useVerticalScroll";

function ScrollArrow() {
    const {
        currentSection,
        totalSections,
        isDownVisible,
        isMobileLandscape,
        scrollToNextSection,
    } = useVerticalScroll({
        scrollOffset: 0.9,
        bottomThreshold: 50,
        scrollBehavior: "smooth",
    });

    // Don't render anything if on mobile landscape
    if (isMobileLandscape) {
        return null;
    }

    return (
        <>
            {isDownVisible && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                    <button
                        onClick={scrollToNextSection}
                        className="btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
                        aria-label="Scroll down to next section"
                        type="button"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </button>

                    {/* Section indicator dots */}
                    <div
                        className="flex justify-center mt-2 space-x-1"
                        role="group"
                        aria-label="Section indicators"
                    >
                        {Array.from({ length: totalSections }, (_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentSection
                                        ? "bg-primary scale-125"
                                        : "bg-primary/30"
                                }`}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default ScrollArrow;
