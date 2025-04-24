export default function Footer() {
  return (
    <footer className="w-full py-6 px-6 md:px-10 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ImageGen Pro. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
