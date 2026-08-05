export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} SkillsVersa. All rights reserved.</p>
      </div>
    </footer>
  );
}
