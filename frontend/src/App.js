import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/lib/auth";
import { SiteProvider, useSite } from "@/lib/site";
import PublicLayout from "@/components/layout/PublicLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Seo, { orgSchema, websiteSchema } from "@/components/Seo";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import { Categories, Journal, JournalPost } from "@/pages/Content";
import { About, Contact, FAQ, Privacy, Terms, Shipping, Returns, Sitemap, SearchPage, NotFound } from "@/pages/Static";
import AdminLogin from "@/pages/admin/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import { Dashboard, AdminProducts, AdminCategories, AdminBlogs, AdminTestimonials, AdminSettings, AdminInquiries } from "@/pages/admin/AdminPages";

const wrap = (el) => <PublicLayout>{el}</PublicLayout>;

function GlobalSeo() {
  const { settings } = useSite();
  return <Seo jsonLd={[orgSchema(settings), websiteSchema(settings)]} />;
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <AuthProvider>
          <SiteProvider>
            <BrowserRouter>
              <ScrollToTop />
              <GlobalSeo />
              <Routes>
              <Route path="/" element={wrap(<Home />)} />
              <Route path="/shop" element={wrap(<Shop />)} />
              <Route path="/product/:slug" element={wrap(<ProductDetail />)} />
              <Route path="/categories" element={wrap(<Categories />)} />
              <Route path="/journal" element={wrap(<Journal />)} />
              <Route path="/journal/:slug" element={wrap(<JournalPost />)} />
              <Route path="/about" element={wrap(<About />)} />
              <Route path="/contact" element={wrap(<Contact />)} />
              <Route path="/faq" element={wrap(<FAQ />)} />
              <Route path="/privacy" element={wrap(<Privacy />)} />
              <Route path="/terms" element={wrap(<Terms />)} />
              <Route path="/shipping" element={wrap(<Shipping />)} />
              <Route path="/returns" element={wrap(<Returns />)} />
              <Route path="/sitemap" element={wrap(<Sitemap />)} />
              <Route path="/search" element={wrap(<SearchPage />)} />

              <Route path="/root-access-mvr/login" element={<AdminLogin />} />
              <Route path="/root-access-mvr" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={wrap(<NotFound />)} />
            </Routes>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
