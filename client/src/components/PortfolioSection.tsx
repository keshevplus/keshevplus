import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ExternalLink, Github, Star, Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PortfolioSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A modern, responsive e-commerce platform built with React, Node.js, and PostgreSQL. Features include real-time inventory, payment processing, and admin dashboard.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      liveUrl: "#",
      githubUrl: "#",
      featured: true,
      metrics: {
        users: "10k+",
        rating: 4.8,
        duration: "3 months"
      }
    },
    {
      id: 2,
      title: "Task Management App",
      description: "Collaborative task management application with real-time updates, team collaboration features, and comprehensive analytics dashboard.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop",
      technologies: ["React", "TypeScript", "Firebase", "Tailwind CSS"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
      metrics: {
        users: "5k+",
        rating: 4.6,
        duration: "2 months"
      }
    },
    {
      id: 3,
      title: "Portfolio Website",
      description: "A minimalist portfolio website showcasing creative work with smooth animations, responsive design, and optimized performance.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      technologies: ["React", "Framer Motion", "Tailwind CSS", "Vite"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
      metrics: {
        users: "2k+",
        rating: 4.9,
        duration: "1 month"
      }
    },
    {
      id: 4,
      title: "Analytics Dashboard",
      description: "Data visualization dashboard with interactive charts, real-time updates, and comprehensive reporting capabilities for business intelligence.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      technologies: ["React", "D3.js", "Python", "FastAPI", "MongoDB"],
      liveUrl: "#",
      githubUrl: "#",
      featured: true,
      metrics: {
        users: "8k+",
        rating: 4.7,
        duration: "4 months"
      }
    },
    {
      id: 5,
      title: "Mobile Banking App",
      description: "Secure mobile banking application with biometric authentication, transaction history, and investment tracking features.",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
      technologies: ["React Native", "Node.js", "MongoDB", "JWT", "Stripe"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
      metrics: {
        users: "15k+",
        rating: 4.5,
        duration: "6 months"
      }
    },
    {
      id: 6,
      title: "Learning Platform",
      description: "Interactive online learning platform with video streaming, progress tracking, and community features for enhanced education.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
      technologies: ["Next.js", "Prisma", "PostgreSQL", "Stripe", "AWS S3"],
      liveUrl: "#",
      githubUrl: "#",
      featured: false,
      metrics: {
        users: "12k+",
        rating: 4.8,
        duration: "5 months"
      }
    }
  ];

  return (
    <section id="portfolio" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent gradient-primary">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A showcase of my recent work spanning web applications, mobile apps, and data platforms. 
            Each project represents a unique challenge and creative solution.
          </p>
        </motion.div>

        {/* Featured Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {projects.filter(project => project.featured).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 * index }}
            >
              <Card className="group gradient-card shadow-medium border-0 hover-lift overflow-hidden h-full">
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover transition-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground hover-lift"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background/90 border-white/20 hover:bg-background"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Code
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Project Metrics */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.metrics.users}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{project.metrics.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{project.metrics.duration}</span>
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs font-medium gradient-card border-0"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* All Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-center mb-8">All Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="group gradient-card shadow-soft border-0 hover-lift overflow-hidden h-full">
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover transition-smooth group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="p-2 bg-background/80 backdrop-blur-sm hover-lift"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="p-2 bg-background/80 backdrop-blur-sm hover-lift"
                      >
                        <Github className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">{project.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      
                      {/* Mini Metrics */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{project.metrics.users}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{project.metrics.rating}</span>
                        </div>
                      </div>

                      {/* Tech Stack (limited) */}
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 gradient-card border-0"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 gradient-card border-0"
                          >
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 font-medium px-8 py-6"
          >
            View All Projects on GitHub
            <Github className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;