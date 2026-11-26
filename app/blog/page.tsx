import { Suspense } from "react";
import BlogDynamicHeader from "./BlogDynamicHeader";
import BlogIndexContent from "./BlogIndexContent";
import { LoadingDots } from "../components/LoadingAnim";
import { areShopAndBlogAvailable } from "../../lib/shopBlogAvailability";
import UnderDevelopment from "../components/UnderDevelopment";
export const revalidate = 300;

export default function BlogIndex() {
  if (!areShopAndBlogAvailable()) return <UnderDevelopment title="Blog" />;

  return (
    <div className="page blog-page">
      <div className="page-body">
        <div className="main-content">
          <BlogDynamicHeader />

          <Suspense fallback={
            <div className="page-loading-spinner">
              <LoadingDots />
            </div>
          }>
            <BlogIndexContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
