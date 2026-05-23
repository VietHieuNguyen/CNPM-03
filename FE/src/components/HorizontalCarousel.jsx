import { useRef, useState, useEffect } from 'react'
import ComicCard from './ComicCard'
import { IconChevronLeft, IconChevronRight } from './Icons'

const HorizontalCarousel = ({ comics = [], showRanking = false }) => {
  const containerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dotsCount, setDotsCount] = useState(1)

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return
    const { scrollLeft, clientWidth, scrollWidth } = container
    
    // Calculate the active page index
    const active = Math.round(scrollLeft / clientWidth)
    setCurrentIndex(active)
  }

  // Update dots when comics load or window resizes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const { clientWidth, scrollWidth } = container
      const total = Math.ceil(scrollWidth / clientWidth)
      setDotsCount(total || 1)
    }

    // Set a slight timeout to ensure layouts are computed
    const timer = setTimeout(handleResize, 100)
    
    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [comics])

  const scroll = (direction) => {
    const container = containerRef.current
    if (!container) return
    const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of view width for overlap
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const scrollToPage = (pageIndex) => {
    const container = containerRef.current
    if (!container) return
    
    const { scrollWidth, clientWidth } = container
    const maxScroll = scrollWidth - clientWidth
    const targetScroll = Math.min(pageIndex * clientWidth, maxScroll)
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  if (!comics || comics.length === 0) return null

  return (
    <div className="relative group/carousel w-full">
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-5 hide-scrollbar cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {comics.map((comic, idx) => (
          <div 
            key={comic._id} 
            className="w-[185px] sm:w-[220px] md:w-[245px] xl:w-[270px] flex-shrink-0 snap-start select-none relative"
          >
            {showRanking && (
              <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-gradient-to-br from-[#b89b5e] to-[#c4a882] flex items-center justify-center text-sm font-black text-[#FEFEFE] shadow-md border-2 border-[#FEFEFE]">
                {idx + 1}
              </div>
            )}
            <ComicCard comic={comic} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {dotsCount > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={currentIndex === 0}
            className="absolute left-[-20px] top-[40%] -translate-y-1/2 w-11 h-11 rounded-full bg-[#FEFEFE] hover:bg-[#b5503a] hover:text-[#FEFEFE] text-[#b5503a] border border-[#d9cbb8] flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none z-10 cursor-pointer"
            aria-label="Scroll left"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={currentIndex >= dotsCount - 1}
            className="absolute right-[-20px] top-[40%] -translate-y-1/2 w-11 h-11 rounded-full bg-[#FEFEFE] hover:bg-[#b5503a] hover:text-[#FEFEFE] text-[#b5503a] border border-[#d9cbb8] flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none z-10 cursor-pointer"
            aria-label="Scroll right"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Horizontal Pagination Dots */}
      {dotsCount > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {Array.from({ length: dotsCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToPage(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-6 bg-[#b5503a]' 
                  : 'w-2.5 bg-[#d9cbb8]/80 hover:bg-[#b5503a]/50'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HorizontalCarousel
