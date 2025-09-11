export function Footer() {
  return (
    <footer className="bg-white border-t border-[#2d2c70] border-t-1 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Navigation Column */}
          <div className="max-w-[200px]">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70]/80 mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">NAVIGATION</h3>
            <ul className="space-y-3 text-[16px] font-[500] font-spartan">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Matador Wholesale
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Asra Aromas
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Point Accessories
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="max-w-[200px] relative md:right-20">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">QUICK LINKS</h3>
            <ul className="space-y-3 text-[16px] font-[500] font-spartan">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Register for wholesale access
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Sales Rep Login
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Keep in Touch Column */}
          <div className="min-w-[400px] relative md:right-32">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">
              KEEP IN TOUCH
            </h3>

            <div className="space-y-4 min-w-[400px]">
              {/* Row 1 */}
              <div className="flex justify-between">
                <div className="text-[#2d2c70] text-[16px] font-[700] font-spartan">
                  Matador Wholesale
                </div>
                <div className="text-[#2d2c70] text-[16px] font-[700] font-spartan">
                  +91 1234567891
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between">
                <div className="text-[#4cbcf9] text-[16px] font-[700] font-spartan">
                  Asra Aromas
                </div>
                <div className="text-[#4cbcf9] text-[16px] font-[700] font-spartan">
                  +91 1234564587
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex justify-between">
                <div className="text-[#e9098d] text-[16px] font-[700] font-spartan">
                  Point Accessories
                </div>
                <div className="text-[#e9098d] text-[16px] font-[700] font-spartan">
                  +91 1235789124
                </div>
              </div>
            </div>
          </div>


          {/* About Us Column */}
          <div className="md:ml-19 relative md:right-10 ]">
            <h3 className="text-[20px] min-w-[300px]  font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">ABOUT POINT AUSTRALIA</h3>
            <div className="space-y-4">
              <p className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan leading-relaxed">
                Point Australia has combined all our wholesale stores into one easy to use online shop.
              </p>
              <div className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan">
                <div>25 Jade Drive,</div>
                <div>Molendinar QLD 2214</div>
              </div>
              <div className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan">ABN: 92 108 558 489</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-2 border-t border-gray-200">
          <div className=" md:text-right">
            <p className=" text-[20px] text-[#000000]/75 text-gary-700 font-[800] font-spartan tracking-tight"><span className="text-[#2d2c70] text-sm font-[400]">© 2025</span> Point Australia</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
