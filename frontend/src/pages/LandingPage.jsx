import React from 'react'

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-20 md:pr-12 md:py-16 px-4 py-8 max-w-7xl gap-8">
          
          {/* Image Section - Mobile First */}
          <div className="w-full md:w-1/2 flex-shrink-0 order-first md:order-first">
            <img 
              src="/Landing Main Image.png" 
              alt="Landing Tea Image"
              className="w-full h-auto aspect-square object-cover bg-gray-200 rounded"
            />
          </div>

          {/* Text Content Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-7 md:gap-8">
            
            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-prosto-one font-normal text-gray-950 leading-tight md:leading-[44px]">
              Every day is unique, just like our tea
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg font-montserrat font-normal text-gray-950 leading-relaxed md:leading-6 letter-spacing-wider">
              Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
              <br />
              <br />
              Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
            </p>

            {/* CTA Button */}
            <div>
              <button className="flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-gray-950 hover:bg-black transition-colors duration-200 rounded">
                <span className="font-montserrat font-medium text-sm md:text-base text-white uppercase tracking-wider">
                  Browse Teas
                </span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gray-100">
        <div className="flex flex-col items-center py-8 md:py-12 px-4 md:px-20 gap-10 md:gap-10">
          
          {/* Features Grid */}
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-6 md:gap-12">
            
            {/* Feature 1: Loose Tea */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3">
                <img src="/coffee-icon.png" alt="coffee" />
              <span className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-tight">
                450+ kind of loose tea
              </span>
            </div>

            {/* Feature 2: Organic Certified */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3">
                <img src="/certified-icon.png" alt="" />
              <span className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-tight">
                Certificated organic teas
              </span>
            </div>

            {/* Feature 3: Free Delivery */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3">
                <img src="/delivery-icon.png" alt="" />
              <span className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-tight">
                Free delivery
              </span>
            </div>

            {/* Feature 4: Sample for All Teas */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3">
                <img src="/tag-icon.png" alt="" />
              <span className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-tight">
                Sample for all teas
              </span>
            </div>

          </div>

          {/* Learn More Button */}
          <button className="w-full md:w-auto flex items-center justify-center px-12 py-3 md:py-3 border-2 border-gray-950 hover:bg-gray-950 hover:text-white transition-colors duration-200">
            <span className="font-montserrat font-medium text-sm md:text-base text-gray-950 hover:text-white uppercase tracking-wider">
              Learn More
            </span>
          </button>

        </div>
      </section>

      {/* Our Collections Section */}
      <section className="w-full bg-white">
        <div className="flex flex-col items-center py-12 md:py-16 px-4 md:px-12 gap-10 md:gap-12 max-w-7xl mx-auto">
          
          {/* Section Heading */}
          <h2 className="text-3xl md:text-4xl font-prosto-one font-normal text-gray-950 text-center">
            Our Collections
          </h2>

          {/* Collections Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
            
            {/* Collection 1: Black Tea */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (1).png" 
                  alt="Black Tea"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Black Tea
              </h3>
            </div>

            {/* Collection 2: Green Tea */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (2).png" 
                  alt="Green Tea"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Green Tea
              </h3>
            </div>

            {/* Collection 3: White Tea */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (3).png" 
                  alt="White Tea"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                White Tea
              </h3>
            </div>

            {/* Collection 4: Matcha */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (4).png" 
                  alt="Matcha"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Matcha
              </h3>
            </div>

            {/* Collection 5: Herbal Tea */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (5).png" 
                  alt="Herbal Tea"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Herbal Tea
              </h3>
            </div>

            {/* Collection 6: Chai */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (6).png" 
                  alt="Chai"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Chai
              </h3>
            </div>

            {/* Collection 7: Oolong */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (7).png" 
                  alt="Oolong"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Oolong
              </h3>
            </div>

            {/* Collection 8: Rooibos */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (8).png" 
                  alt="Rooibos"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Rooibos
              </h3>
            </div>

            {/* Collection 9: Teaware */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-full aspect-square bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="/collection (9).png" 
                  alt="Teaware"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm md:text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
                Teaware
              </h3>
            </div>

          </div>

        </div>
      </section>

    </>
  )
}

export default LandingPage