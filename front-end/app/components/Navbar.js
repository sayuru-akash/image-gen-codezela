export default function Navbar() {
  return (
    <nav className="w-full py-4 px-6 md:px-10 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          ImageGen Pro
        </span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-gray-300 hover:text-white">
          Features
        </a>
        <a href="#" className="text-gray-300 hover:text-white">
          Pricing
        </a>
        <a href="#" className="text-gray-300 hover:text-white">
          Examples
        </a>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
          Sign In
        </button>
      </div>
    </nav>
  );
}
