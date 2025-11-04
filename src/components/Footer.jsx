
'use client'
import axiosInstance from "@/axios/axiosInstance";
import useUserStore from "@/zustand/user";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useUserStore((state) => state.user);

  const fetchBrands = async () => {
    try {
      const res = await axiosInstance.get('brand/get-brands-list')

      console.log("brands response ", res.data.data)

      if (res.data.statusCode === 200) {
        setBrands(res.data.data)
        setLoading(false)
      } else {
        setError(res.data.message)
        setLoading(false)
      }
    } catch (error) {
      setError(error.message)
      console.error("Error fetching brands:", error)
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchBrands()
  }, [])

  return (
    <footer className="bg-white border-t border-[#2d2c70] border-t-1 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Navigation Column */}
          <div className="md:max-w-none lg:max-w-[125px] max-w-[125px] xl:min-w-[125px]">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">NAVIGATION</h3>
            <ul className="space-y-3 text-[16px] font-[500] font-spartan md:min-w-[200px] lg:min-w-0 xl:min-w-[200px]">
              <li>
                <a href="/" className="text-gray-600 transition-colors hover:text-[#E9098D]">
                  Home
                </a>
              </li>
              {loading ? (
                <li className="text-gray-400">Loading brands...</li>
              ) : error ? (
                <li className="text-red-500">Error loading brands</li>
              ) : (
                brands.map((brand) => (
                  <li key={brand._id}>
                    <a
                      href={`/brand/${brand.slug}`}
                      className="text-gray-600 transition-colors hover:text-[#E9098D]"
                    >
                      {brand.name}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="md:max-w-none lg:max-w-[125px] max-w-[125px] xl:min-w-[200px] relative md:right-0 lg:right-20">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">QUICK LINKS</h3>
            <ul className="space-y-3 text-[16px] font-[500] font-spartan md:min-w-[300px] lg:min-w-0 xl:min-w-[160px]">
              {!user && <li>
                <a href="/login" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Login
                </a>
              </li>}
              {!user && <li>
                <a href="/sign-up" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Register for wholesale access
                </a>
              </li>}
              <li>
                <Link href="/sales-rep-login" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Sales Rep Login
                </Link>
              </li>
              <li>
                <a href="/contact-us" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Contact us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-[#E9098D] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Keep in Touch Column */}
          <div className="xl:min-w-[400px] max-w-[175px] md:max-w-none lg:max-w-[175px] md:min-w-[350px] lg:min-w-[400px] relative md:right-0 lg:right-32">
            <h3 className="text-[20px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">
              KEEP IN TOUCH
            </h3>

            <div className="space-y-4 md:min-w-[350px] lg:min-w-[400px] min-w-[300px]">
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
          <div className="md:ml-0 lg:ml-19 relative md:right-0 lg:right-10">
            <h3 className="text-[20px] md:min-w-[280px] lg:min-w-[244px] xl:min-w-[300px] max-w-[250px] font-[700] font-spartan text-[#2d2c70] mb-6 uppercase tracking-wide border-b border-[#2d2c70] border-b-1">
              ABOUT POINT AUSTRALIA
            </h3>
            <div className="space-y-4 min-w-[280px]">
              <p className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan leading-relaxed">
                Point Australia has combined all our wholesale stores into one easy to use online shop.
              </p>
              <div className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan">
                <div>25 Jade Drive,</div>
                <div>Molendinar QLD 2214</div>
              </div>
              <div className="text-[#2d2c70]/80 text-[16px] font-[500] font-spartan">ABN: 92 108 558 489</div>

              <div className="flex space-x-2 pt-6">
                <Image
                  src="/account-details/payment-images.png"
                  alt="Matador Wholesale Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
                <Image
                  src="/account-details/visa-img-1.png"
                  alt="Matador Wholesale Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-2 border-t-1 border-[#2d2c70]">
          <div className="md:text-right">
            <p className="text-[20px] text-[#000000]/75 text-gary-700 font-[600] font-spartan tracking-tight">
              <span className="font-medium text-[#00000080]">© 2025</span> Point Australia
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}