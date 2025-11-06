"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Camera,
  Edit3,
  ImageIcon,
  Wand2,
  ArrowRight,
  Sparkles,
  Palette,
} from "lucide-react";

export default function DashboardHome() {
  return (
    <ProtectedRoute>
      <DashboardHomeContent />
    </ProtectedRoute>
  );
}

function DashboardHomeContent() {
  const { data: session } = useSession();

  const dashboardFeatures = [
    {
      title: "Text to Image",
      description: "Generate stunning images from text descriptions using AI",
      icon: <Wand2 className="w-8 h-8" />,
      href: "/text-to-image",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Dual Image Editor",
      description: "Edit and enhance images with advanced AI tools",
      icon: <Edit3 className="w-8 h-8" />,
      href: "/dual-image-editor",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Edit with Mask",
      description: "Precise image editing with intelligent masking",
      icon: <Palette className="w-8 h-8" />,
      href: "/edit-with-mask",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Image Update",
      description: "Update and modify existing images seamlessly",
      icon: <ImageIcon className="w-8 h-8" />,
      href: "/image-update",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#181D28] text-white">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-white from-20% to-gold to-80% rounded-full"></div>
              <h1 className="text-2xl font-bold">kAIro Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/70">
                Welcome back, {session?.user?.name || session?.user?.email}
              </span>
              <div className="w-8 h-8 bg-gradient-to-r from-gold to-white/60 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-dark-blue">
                  {session?.user?.name?.charAt(0) ||
                    session?.user?.email?.charAt(0) ||
                    "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gold from-20% to-white to-80% bg-clip-text text-transparent">
              Create Amazing Images with AI
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Unleash your creativity with our powerful AI-driven image
              generation and editing tools. Transform your ideas into stunning
              visuals in seconds.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Powered</h3>
              <p className="text-sm text-white/70">
                Advanced machine learning models
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-white/70">
                Professional grade outputs
              </p>
            </div>

            <div className="bg-gradient-to-br from-gold/20 to-yellow-500/20 border border-gold/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
              <p className="text-sm text-white/70">
                Intuitive interface design
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center">
            Choose Your Creative Tool
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {dashboardFeatures.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group bg-gray-800/50 hover:bg-gray-800/70 border border-white/10 hover:border-gold/50 rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-gold transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-white/70 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-gold group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-medium">Get Started</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-gradient-to-r from-gold/10 to-white/5 border border-gold/20 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Choose any tool above to begin creating amazing images. Each tool is
            designed to help you achieve different creative goals with the power
            of AI.
          </p>
          <Link
            href="/text-to-image"
            className="inline-flex items-center bg-gradient-to-r from-gold to-yellow-500 text-dark-blue font-semibold px-8 py-3 rounded-full hover:from-yellow-500 hover:to-gold transition-all duration-300"
          >
            Start Creating
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
