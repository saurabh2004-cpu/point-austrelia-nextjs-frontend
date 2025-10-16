'use client'

import BrandCards from "@/components/Home-components/BrandCards";
import Carousel from "@/components/Home-components/Carousel";
import useUserStore from "@/zustand/user";
import MetaTags from "../components/metaTags/metaTags";
import { useMetaData } from "@/hooks/useMetaData";

export default function Home() {
  const currentUser = useUserStore((state) => state.user);
  console.log("current user:", currentUser);
  const { metaData, loading } = useMetaData('home');

  // Add loading state handling
  if (loading) {
    return (
      <>
        {/* Basic meta tags while loading */}
        <MetaTags
          title="Loading..."
          description="Please wait while we load the page"
        />
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <MetaTags
        title={metaData?.title || "Default Home Title"}
        description={metaData?.description || "Default home description"}
        keywords={metaData?.keywords || "default, keywords"}
        ogImage={metaData?.ogImage}
      />

      <BrandCards />
      <Carousel />
    </>
  );
}