import React from 'react'
import { useAuth } from "@/components/auth/AuthProvider"
import { useLanguage } from "@/hooks/useLanguage"
import AdminLogin from "@/components/auth/AdminLogin"
import AdminDashboard from "@/components/admin/AdminDashboard"
import MedicalHero from "@/components/MedicalHero"
import AboutSection from "@/components/AboutSection"
import ServicesSection from "@/components/ServicesSection"
import ADHDInfoSection from "@/components/ADHDInfoSection"
import FAQSection from "@/components/FAQSection"
import ContactSection from "@/components/ContactSection"
import Footer from "@/components/Footer"

const Index = () => {
  const { user, loading, isAdmin } = useAuth()
  const { language } = useLanguage()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" aria-label="Loading"></div>
      </div>
    )
  }

  // Admin routes
  if (user && isAdmin) {
    return <AdminDashboard />
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  if (window.location.pathname === '/admin' || window.location.search.includes('admin')) {
    return <AdminLogin />
  }

  // Main public website
  return (
    <div className="min-h-screen bg-background">
      <MedicalHero />
      <AboutSection />
      <ServicesSection />
      <ADHDInfoSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default Index
