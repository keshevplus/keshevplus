import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import professionalHeadshot from "@/assets/professional-headshot.jpg";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      >
        <div className="absolute inset-0 gradient-hero opacity-90" />
      </div>

      {/* Floating Shapes Animation */}
      <div className="floating-shapes">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-shape"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Professional Headshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto"
          >
            <div className="w-48 h-48 mx-auto relative">
              <img
                src={professionalHeadshot}
                alt="Professional headshot"
                className="w-full h-full object-cover rounded-full shadow-strong hover-glow transition-smooth"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20" />
            </div>
          </motion.div>

          {/* Brand Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-6xl lg:text-8xl font-bold bg-clip-text text-transparent gradient-primary bg-gradient-to-r from-primary to-accent">
              Creative Developer
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Crafting exceptional digital experiences through innovative design, 
              clean code, and user-centered thinking. Let's build something amazing together.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg" 
              className="gradient-primary text-primary-foreground hover-lift font-semibold px-8 py-6 text-lg"
            >
              View My Work
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/30 hover:bg-primary/10 font-semibold px-8 py-6 text-lg"
            >
              Get in Touch
            </Button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center space-x-6 pt-8"
          >
            {[
              { icon: Github, href: "#", label: "GitHub" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
              { icon: Mail, href: "#", label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-background/80 shadow-soft hover-glow transition-smooth"
                aria-label={label}
              >
                <Icon className="w-6 h-6 text-primary" />
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            onClick={scrollToNext}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-background/80 shadow-soft hover-glow transition-smooth"
            aria-label="Scroll to next section"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown className="w-6 h-6 text-primary" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;