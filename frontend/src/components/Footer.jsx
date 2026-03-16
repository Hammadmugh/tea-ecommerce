import React from 'react'

export default function Footer() {
  const collections = [
    'Black teas',
    'Green teas',
    'White teas',
    'Herbal teas',
    'Matcha',
    'Chai',
    'Oolong',
    'Rooibos',
    'Teaware'
  ]

  const learnLinks = [
    'About us',
    'About our teas',
    'Tea academy'
  ]

  const serviceLinks = [
    'Ordering and payment',
    'Delivery',
    'Privacy and policy',
    'Terms & Conditions'
  ]

  return (
    <footer className="w-full bg-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start px-4 md:px-16 py-10 md:py-8 gap-8 md:gap-6 max-w-7xl mx-auto">
        
        {/* Column 1: Collections */}
        <div className="flex flex-col gap-6 min-w-fit">
          <h3 className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
            Collections
          </h3>
          <div className="flex flex-col gap-2">
            {collections.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-sm font-montserrat font-normal text-gray-950 hover:underline transition-all"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Learn */}
        <div className="flex flex-col gap-6 min-w-fit">
          <h3 className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
            Learn
          </h3>
          <div className="flex flex-col gap-2">
            {learnLinks.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-sm font-montserrat font-normal text-gray-950 hover:underline transition-all"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Column 3: Customer Service */}
        <div className="flex flex-col gap-6 min-w-fit">
          <h3 className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
            Customer Service
          </h3>
          <div className="flex flex-col gap-2">
            {serviceLinks.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-sm font-montserrat font-normal text-gray-950 hover:underline transition-all"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Column 4: Contact Us */}
        <div className="flex flex-col gap-6 min-w-fit">
          <h3 className="text-base font-montserrat font-medium text-gray-950 uppercase tracking-wider">
            Contact Us
          </h3>
          
          {/* Address */}
          <div className="flex flex-row gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src="/location-icon.png" alt="" />
            </div>
            <p className="text-sm font-montserrat font-normal text-gray-950 leading-relaxed">
              3 Falahi, Falahi St, Pasdaran Ave, Shiraz, <br />Fars Provieence Iran
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-row gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src="/email-icon.png" alt="" />
            </div>
            <a href="mailto:amoopur@gmail.com" className="text-sm font-montserrat font-normal text-gray-950 hover:underline transition-all">
              Email: amoopur@gmail.com
            </a>
          </div>

          {/* Phone */}
          <div className="flex flex-row gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src="/phone-icon.png" alt="" />
            </div>
            <a href="tel:+989173038406" className="text-sm font-montserrat font-normal text-gray-950 hover:underline transition-all">
              Tel: +98 9173038406
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}