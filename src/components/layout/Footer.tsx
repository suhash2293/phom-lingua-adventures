
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {currentYear} Moilen Nyiam, PhomShah. The Phom Dialect Learning Platform.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/privacy"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Terms
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
