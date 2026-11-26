import { Suspense } from "react";
import BlogDynamicHeader from "./BlogDynamicHeader";
import BlogIndexContent from "./BlogIndexContent";
import { LoadingDots } from "../components/LoadingAnim";
import { areShopAndBlogAvailable } from "../../lib/shopBlogAvailability";
import UnderDevelopment from "../components/UnderDevelopment";
import type { Metadata } from "next";
export const revalidate = 300;

export function generateMetadata(): Metadata {
  const underDevelopment = !areShopAndBlogAvailable();
  return {
    title: underDevelopment ? "Blog under development | That Josh Guy" : "Blog | That Josh Guy",
    robots: underDevelopment ? { index: false, follow: true } : undefined,
  };
}

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
