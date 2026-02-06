import { Link } from "wouter";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-404">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Page not found</p>
        <Link
          href="/"
          className="text-green-700 hover:text-green-800 underline underline-offset-4 transition-colors"
          data-testid="link-home"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
